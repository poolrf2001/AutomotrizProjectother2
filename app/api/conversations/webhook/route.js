import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

function normalizePhone(rawPhone) {
  return String(rawPhone || "")
    .replace(/[^\d+]/g, "")
    .trim();
}

function isMissingColumnError(error) {
  return error?.code === "ER_BAD_FIELD_ERROR" || error?.errno === 1054;
}

function isMissingTableError(error) {
  return error?.code === "ER_NO_SUCH_TABLE" || error?.errno === 1146;
}

function normalizePlatform(raw) {
  const value = String(raw || "").trim().toLowerCase();
  if (value === "instagram" || value === "facebook") return value;
  return null;
}

function normalizeCell(rawPhone) {
  return String(rawPhone || "").replace(/\D/g, "").trim();
}

async function resolvePhoneFromSocialIdentity(platform, platformId) {
  if (!platform || !platformId) return null;

  try {
    const [rows] = await db.query(
      `
      SELECT celular
      FROM social_identities
      WHERE platform = ?
        AND platform_id = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [platform, platformId]
    );

    const celular = rows?.[0]?.celular;
    if (!celular) return null;
    return normalizePhone(celular);
  } catch (error) {
    if (isMissingTableError(error) || isMissingColumnError(error)) return null;
    throw error;
  }
}

async function linkSocialIdentity({ platform, platformId, phone }) {
  if (!platform || !platformId || !phone) {
    return { linked: false, reason: "Datos incompletos para vinculación" };
  }

  const celular = normalizeCell(phone);
  if (!celular) return { linked: false, reason: "Celular inválido" };

  try {
    const [rows] = await db.query(
      `
      SELECT id, celular
      FROM social_identities
      WHERE platform = ?
        AND platform_id = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [platform, platformId]
    );

    const existing = rows?.[0] || null;

    if (existing?.id) {
      if (String(existing.celular || "") !== celular) {
        await db.query(
          `
          UPDATE social_identities
          SET celular = ?
          WHERE id = ?
          `,
          [celular, existing.id]
        );
      }

      return { linked: true, updated: true };
    }

    await db.query(
      `
      INSERT INTO social_identities (platform, platform_id, celular, created_at)
      VALUES (?, ?, ?, NOW())
      `,
      [platform, platformId, celular]
    );

    return { linked: true, created: true };
  } catch (error) {
    if (isMissingTableError(error) || isMissingColumnError(error)) {
      return { linked: false, reason: "Tabla social_identities no disponible" };
    }
    throw error;
  }
}

function getSlaMinutes() {
  const raw = Number(process.env.CONVERSATIONS_SLA_MINUTES || 30);
  if (Number.isNaN(raw)) return 30;
  return Math.max(5, Math.min(raw, 1440));
}

async function findByExternalMessageId(externalMessageId) {
  if (!externalMessageId) return null;

  try {
    const [rows] = await db.query(
      `
      SELECT id, session_id, message_status, created_at
      FROM agent_actions_log
      WHERE external_message_id = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [externalMessageId]
    );
    return rows?.[0] || null;
  } catch (error) {
    if (isMissingColumnError(error)) return null;
    throw error;
  }
}

async function updateMessageStatusByExternalId(externalMessageId, status, providerPayload) {
  try {
    const [result] = await db.query(
      `
      UPDATE agent_actions_log
      SET
        message_status = ?,
        provider_payload_json = ?,
        success = ?,
        error_message = CASE WHEN ? = 'failed' THEN COALESCE(error_message, 'Proveedor marco error') ELSE NULL END
      WHERE external_message_id = ?
      `,
      [
        status,
        providerPayload ? JSON.stringify(providerPayload) : null,
        status === "failed" ? 0 : 1,
        status,
        externalMessageId,
      ]
    );
    return result?.affectedRows || 0;
  } catch (error) {
    if (isMissingColumnError(error)) return 0;
    throw error;
  }
}

async function insertInboundLog({
  sessionId,
  phone,
  text,
  sourceChannel,
  source,
  externalMessageId,
  providerPayload,
}) {
  const idempotencyKey = `inbound:${externalMessageId || randomUUID()}`;

  try {
    const [result] = await db.query(
      `
      INSERT INTO agent_actions_log (
        session_id,
        phone,
        action_type,
        intent,
        request_text,
        response_text,
        message_direction,
        message_status,
        source_channel,
        external_message_id,
        idempotency_key,
        provider_payload_json,
        success,
        error_message,
        created_at
      ) VALUES (?, ?, 'INBOUND_MESSAGE', 'INBOUND_MESSAGE', ?, NULL, 'inbound', 'received', ?, ?, ?, ?, 1, NULL, NOW())
      `,
      [
        sessionId,
        phone || null,
        text,
        sourceChannel || source || null,
        externalMessageId || null,
        idempotencyKey,
        providerPayload ? JSON.stringify(providerPayload) : null,
      ]
    );

    return { id: result.insertId, tracked: true, idempotencyKey };
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;

    const [legacyResult] = await db.query(
      `
      INSERT INTO agent_actions_log (
        session_id,
        phone,
        action_type,
        intent,
        request_text,
        response_text,
        success,
        error_message,
        created_at
      ) VALUES (?, ?, 'INBOUND_MESSAGE', 'INBOUND_MESSAGE', ?, NULL, 1, NULL, NOW())
      `,
      [sessionId, phone || null, text]
    );

    return { id: legacyResult.insertId, tracked: false, idempotencyKey };
  }
}

async function resolveSessionId(phone, clientId) {
  if (clientId) {
    const [byClient] = await db.query(
      `
      SELECT id
      FROM conversation_sessions
      WHERE client_id = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [clientId]
    );

    if (byClient?.[0]?.id) return byClient[0].id;
  }

  const [byPhone] = await db.query(
    `
    SELECT id
    FROM conversation_sessions
    WHERE phone = ?
    ORDER BY id DESC
    LIMIT 1
    `,
    [phone]
  );

  if (byPhone?.[0]?.id) return byPhone[0].id;

  const [inserted] = await db.query(
    `
    INSERT INTO conversation_sessions (
      phone,
      state,
      client_id,
      created_at,
      updated_at
    ) VALUES (?, 'NO_HISTORIAL', ?, NOW(), NOW())
    `,
    [phone || null, clientId || null]
  );

  return inserted.insertId;
}

// POST /api/conversations/webhook
// Este endpoint recibe mensajes entrantes normalizados desde n8n/proveedor.
// Header opcional: x-conversations-webhook-secret
// Body:
// {
//   phone: string,
//   text: string,
//   source?: string,
//   client_id?: number,
//   platform?: "instagram" | "facebook",
//   platform_id?: string,
//   external_message_id?: string,
//   event_type?: "message" | "status",
//   status?: "queued" | "sent" | "delivered" | "read" | "failed",
//   source_channel?: string,
//   payload?: object
// }
export async function POST(req) {
  try {
    const expectedSecret = process.env.CONVERSATIONS_WEBHOOK_SECRET;
    const providedSecret = req.headers.get("x-conversations-webhook-secret") || "";

    if (expectedSecret && providedSecret !== expectedSecret) {
      return NextResponse.json({ message: "Webhook no autorizado" }, { status: 401 });
    }

    const body = await req.json();

    const eventType = (body?.event_type || "message").trim();
    const externalMessageId = (body?.external_message_id || "").trim();
    const sourceChannel = (body?.source_channel || "whatsapp").trim();
    const providerPayload = body?.payload || null;

    if (eventType === "status") {
      const status = (body?.status || "").trim();
      if (!externalMessageId || !status) {
        return NextResponse.json(
          { message: "external_message_id y status son requeridos" },
          { status: 400 }
        );
      }

      const allowedStatuses = new Set(["queued", "sent", "delivered", "read", "failed"]);
      if (!allowedStatuses.has(status)) {
        return NextResponse.json({ message: "status inválido" }, { status: 400 });
      }

      const affected = await updateMessageStatusByExternalId(
        externalMessageId,
        status,
        providerPayload
      );

      return NextResponse.json({
        message: "Estado procesado",
        external_message_id: externalMessageId,
        status,
        updated_rows: affected,
      });
    }

    const text = (body?.text || "").trim();
    const source = (body?.source || "n8n").trim();
    const platform = normalizePlatform(body?.platform || body?.source_channel || source);
    const platformId = String(
      body?.platform_id || body?.social_id || body?.sender_id || ""
    ).trim();
    const providedPhone = normalizePhone(body?.phone);
    const identityPhone = providedPhone
      ? null
      : await resolvePhoneFromSocialIdentity(platform, platformId);
    const phone = providedPhone || identityPhone;
    const clientId = Number(body?.client_id) || null;

    if (!text) {
      return NextResponse.json({ message: "text es requerido" }, { status: 400 });
    }

    if (!phone && !clientId) {
      return NextResponse.json(
        {
          message: "Se requiere phone o client_id (o identidad social ya vinculada)",
          needs_identity_link: Boolean(platform && platformId),
          platform: platform || null,
          platform_id: platformId || null,
        },
        { status: 400 }
      );
    }

    const duplicate = await findByExternalMessageId(externalMessageId);
    if (duplicate) {
      return NextResponse.json(
        {
          message: "Mensaje ya procesado",
          deduplicated: true,
          message_id: duplicate.id,
          session_id: duplicate.session_id,
          external_message_id: externalMessageId,
        },
        { status: 200 }
      );
    }

    const sessionId = await resolveSessionId(phone, clientId);

    const inserted = await insertInboundLog({
      sessionId,
      phone,
      text,
      sourceChannel,
      source,
      externalMessageId,
      providerPayload,
    });

    const identityLink = await linkSocialIdentity({
      platform,
      platformId,
      phone,
    });

    const slaMinutes = getSlaMinutes();
    try {
      await db.query(
        `
        UPDATE conversation_sessions
        SET
          updated_at = NOW(),
          last_intent = 'INBOUND_MESSAGE',
          last_message_id = ?,
          last_inbound_at = NOW(),
          assignment_status = CASE
            WHEN COALESCE(assignment_status, 'unassigned') = 'closed' THEN 'open'
            ELSE COALESCE(assignment_status, 'open')
          END,
          sla_due_at = DATE_ADD(NOW(), INTERVAL ? MINUTE)
        WHERE id = ?
        `,
        [inserted.id, slaMinutes, sessionId]
      );
    } catch (error) {
      if (!isMissingColumnError(error)) throw error;

      await db.query(
        `
        UPDATE conversation_sessions
        SET
          updated_at = NOW(),
          last_intent = 'INBOUND_MESSAGE',
          last_message_id = ?
        WHERE id = ?
        `,
        [inserted.id, sessionId]
      );
    }

    return NextResponse.json(
      {
        message: "Webhook procesado",
        session_id: sessionId,
        message_id: inserted.id,
        source,
        source_channel: sourceChannel,
        platform: platform || null,
        platform_id: platformId || null,
        identity_phone_resolved: Boolean(identityPhone),
        identity_linked: Boolean(identityLink?.linked),
        external_message_id: externalMessageId || null,
        tracking_enabled: inserted.tracked,
        idempotency_key: inserted.idempotencyKey,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ ERROR webhook conversaciones:", error);
    return NextResponse.json(
      { message: "Error procesando webhook" },
      { status: 500 }
    );
  }
}
