import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";
import { authorizeConversation } from "@/lib/conversationsAuth";
import {
  enqueueOutbound,
  isMissingTableError,
  processOutboxItem,
} from "@/lib/conversationsOutbox";

async function notifyN8n(payload) {
  const webhookUrl = process.env.N8N_CONVERSATIONS_OUTBOUND_URL;

  if (!webhookUrl) {
    return { forwarded: false, reason: "N8N_CONVERSATIONS_OUTBOUND_URL no configurado" };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      return {
        forwarded: false,
        reason: `Error ${res.status} al reenviar a n8n: ${body}`,
      };
    }

    return { forwarded: true };
  } catch (error) {
    return {
      forwarded: false,
      reason: `No se pudo conectar con n8n: ${error.message}`,
    };
  }
}

function isMissingColumnError(error) {
  return error?.code === "ER_BAD_FIELD_ERROR" || error?.errno === 1054;
}

function getSlaMinutes() {
  const raw = Number(process.env.CONVERSATIONS_SLA_MINUTES || 30);
  if (Number.isNaN(raw)) return 30;
  return Math.max(5, Math.min(raw, 1440));
}

function normalizeCell(rawPhone) {
  return String(rawPhone || "").replace(/\D/g, "").trim();
}

function normalizeSocialPlatform(rawChannel) {
  const value = String(rawChannel || "").trim().toLowerCase();
  if (value === "instagram" || value === "facebook") return value;
  return null;
}

async function resolveSocialRecipient({ phone, sourceChannel }) {
  const platform = normalizeSocialPlatform(sourceChannel);
  if (!platform || !phone) return null;

  const compact = normalizeCell(phone);
  const candidates = [...new Set([
    String(phone || "").trim(),
    compact,
    compact?.length === 9 ? `51${compact}` : null,
    compact?.length === 9 ? `+51${compact}` : null,
  ].filter(Boolean))];

  if (!candidates.length) return null;

  try {
    const placeholders = candidates.map(() => "?").join(", ");
    const [rows] = await db.query(
      `
      SELECT platform, platform_id, celular
      FROM social_identities
      WHERE platform = ?
        AND celular IN (${placeholders})
      ORDER BY id DESC
      LIMIT 1
      `,
      [platform, ...candidates]
    );

    const found = rows?.[0] || null;
    if (!found?.platform_id) return null;

    return {
      platform,
      platform_id: String(found.platform_id),
      celular: found.celular || null,
    };
  } catch (error) {
    if (isMissingColumnError(error) || error?.code === "ER_NO_SUCH_TABLE" || error?.errno === 1146) {
      return null;
    }
    throw error;
  }
}

async function findByIdempotency(idempotencyKey) {
  try {
    const [rows] = await db.query(
      `
      SELECT id, session_id, message_status, source_channel, created_at
      FROM agent_actions_log
      WHERE idempotency_key = ?
      LIMIT 1
      `,
      [idempotencyKey]
    );
    return rows?.[0] || null;
  } catch (error) {
    if (isMissingColumnError(error)) return null;
    throw error;
  }
}

async function insertLogMessage({
  sessionId,
  phone,
  actionType,
  requestText,
  responseText,
  direction,
  sourceChannel,
  externalMessageId,
  idempotencyKey,
  messageStatus,
  providerPayload,
}) {
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NULL, NOW())
      `,
      [
        sessionId,
        phone || null,
        actionType,
        actionType,
        requestText,
        responseText,
        direction,
        messageStatus,
        sourceChannel || null,
        externalMessageId || null,
        idempotencyKey || null,
        providerPayload ? JSON.stringify(providerPayload) : null,
      ]
    );

    return { id: result.insertId, tracked: true };
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
      ) VALUES (?, ?, ?, ?, ?, ?, 1, NULL, NOW())
      `,
      [sessionId, phone || null, actionType, actionType, requestText, responseText]
    );

    return { id: legacyResult.insertId, tracked: false };
  }
}

async function updateDeliveryState(logId, { status, success, errorMessage }) {
  try {
    await db.query(
      `
      UPDATE agent_actions_log
      SET message_status = ?, success = ?, error_message = ?
      WHERE id = ?
      `,
      [status, success ? 1 : 0, errorMessage || null, logId]
    );
    return true;
  } catch (error) {
    if (isMissingColumnError(error)) return false;
    throw error;
  }
}

async function updateSessionAfterMessage({ sessionId, actionType, messageId, isInbound }) {
  if (isInbound) {
    const slaMinutes = getSlaMinutes();

    try {
      await db.query(
        `
        UPDATE conversation_sessions
        SET
          updated_at = NOW(),
          last_intent = ?,
          last_message_id = ?,
          last_inbound_at = NOW(),
          assignment_status = CASE
            WHEN COALESCE(assignment_status, 'unassigned') = 'closed' THEN 'open'
            ELSE COALESCE(assignment_status, 'open')
          END,
          sla_due_at = DATE_ADD(NOW(), INTERVAL ? MINUTE)
        WHERE id = ?
        `,
        [actionType, messageId, slaMinutes, sessionId]
      );
      return;
    } catch (error) {
      if (!isMissingColumnError(error)) throw error;
    }
  }

  await db.query(
    `
    UPDATE conversation_sessions
    SET
      updated_at = NOW(),
      last_intent = ?,
      last_message_id = ?
    WHERE id = ?
    `,
    [actionType, messageId, sessionId]
  );
}

// POST /api/conversations/messages
// Body:
// {
//   session_id: number,
//   text: string,
//   direction?: "outbound" | "inbound",
//   source?: string,
//   external_message_id?: string,
//   idempotency_key?: string,
//   source_channel?: string
// }
export async function POST(req) {
  const auth = authorizeConversation(req, "create");
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();

    const sessionId = Number(body?.session_id);
    const text = (body?.text || "").trim();
    const direction = body?.direction === "inbound" ? "inbound" : "outbound";
    const source = (body?.source || "manual_ui").trim();
    const externalMessageId = (body?.external_message_id || "").trim();
    const idempotencyKey = (body?.idempotency_key || randomUUID()).trim();
    const sourceChannel = (body?.source_channel || "whatsapp").trim();

    if (!sessionId || Number.isNaN(sessionId)) {
      return NextResponse.json({ message: "session_id inválido" }, { status: 400 });
    }

    if (!text) {
      return NextResponse.json({ message: "text es requerido" }, { status: 400 });
    }

    const [sessions] = await db.query(
      `
      SELECT id, phone
      FROM conversation_sessions
      WHERE id = ?
      LIMIT 1
      `,
      [sessionId]
    );

    const session = sessions?.[0];

    if (!session) {
      return NextResponse.json({ message: "Sesión no encontrada" }, { status: 404 });
    }

    const isInbound = direction === "inbound";
    const actionType = isInbound ? "INBOUND_MESSAGE" : "MANUAL_OUTBOUND";
    const initialStatus = isInbound ? "received" : "queued";

    const requestText = isInbound ? text : null;
    const responseText = isInbound ? null : text;

    const existing = await findByIdempotency(idempotencyKey);
    if (existing) {
      return NextResponse.json(
        {
          message: "Mensaje ya procesado",
          id: existing.id,
          deduplicated: true,
          idempotency_key: idempotencyKey,
        },
        { status: 200 }
      );
    }

    const inserted = await insertLogMessage({
      sessionId,
      phone: session.phone,
      actionType,
      requestText,
      responseText,
      direction,
      sourceChannel,
      externalMessageId,
      idempotencyKey,
      messageStatus: initialStatus,
      providerPayload: null,
    });

    await updateSessionAfterMessage({
      sessionId,
      actionType,
      messageId: inserted.id,
      isInbound,
    });

    let forwardResult = { forwarded: false, reason: "No aplica para inbound" };
    let finalStatus = initialStatus;
    let deliveryTrackingEnabled = inserted.tracked;

    if (!isInbound) {
      const socialRecipient = await resolveSocialRecipient({
        phone: session.phone,
        sourceChannel,
      });

      const outboundPayload = {
        session_id: sessionId,
        phone: session.phone,
        text,
        source,
        source_channel: sourceChannel,
        platform: socialRecipient?.platform || null,
        platform_id: socialRecipient?.platform_id || null,
        idempotency_key: idempotencyKey,
        external_message_id: externalMessageId || null,
        created_at: new Date().toISOString(),
      };

      try {
        const outbox = await enqueueOutbound({
          sessionId,
          messageLogId: inserted.id,
          phone: session.phone,
          source,
          sourceChannel,
          idempotencyKey,
          externalMessageId,
          payload: outboundPayload,
        });

        if (outbox.enabled && outbox.id) {
          const processResult = await processOutboxItem(outbox.id);

          if (processResult.ok) {
            forwardResult = { forwarded: true, outbox_id: outbox.id };
            finalStatus = "sent";
          } else {
            forwardResult = {
              forwarded: false,
              outbox_id: outbox.id,
              reason: processResult.reason || "Pendiente de reintento",
              outbox_status: processResult.status || "retrying",
            };
            finalStatus = processResult.status === "failed" ? "failed" : "queued";
          }
        } else {
          // Fallback temporal si no existe la tabla outbox.
          forwardResult = await notifyN8n(outboundPayload);
          finalStatus = forwardResult.forwarded ? "sent" : "failed";
          deliveryTrackingEnabled = await updateDeliveryState(inserted.id, {
            status: finalStatus,
            success: forwardResult.forwarded,
            errorMessage: forwardResult.forwarded ? null : forwardResult.reason,
          });
        }
      } catch (error) {
        if (isMissingTableError(error)) {
          forwardResult = await notifyN8n(outboundPayload);
          finalStatus = forwardResult.forwarded ? "sent" : "failed";
          deliveryTrackingEnabled = await updateDeliveryState(inserted.id, {
            status: finalStatus,
            success: forwardResult.forwarded,
            errorMessage: forwardResult.forwarded ? null : forwardResult.reason,
          });
        } else {
          throw error;
        }
      }
    }

    return NextResponse.json(
      {
        message: "Mensaje registrado",
        id: inserted.id,
        direction,
        source,
        source_channel: sourceChannel,
        message_status: finalStatus,
        idempotency_key: idempotencyKey,
        tracking_enabled: deliveryTrackingEnabled,
        n8n: forwardResult,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ ERROR creando mensaje:", error);
    return NextResponse.json(
      { message: "Error registrando mensaje" },
      { status: 500 }
    );
  }
}
