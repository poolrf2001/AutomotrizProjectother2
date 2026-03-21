import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/conversations/send-message
 *
 * Endpoint para que el agente Ventas IA envíe mensajes de WhatsApp.
 * Auth: x-conversations-webhook-secret
 *
 * Body: { phone, message, channel? }
 */
export async function POST(req) {
  const secret = process.env.CONVERSATIONS_WEBHOOK_SECRET;
  const provided = req.headers.get("x-conversations-webhook-secret") || "";
  if (secret && provided !== secret) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const phone = String(body?.phone || "").trim();
  const message = String(body?.message || "").trim();
  const channel = String(body?.channel || "whatsapp").toLowerCase();

  if (!phone || !message) {
    return NextResponse.json({ message: "phone y message son requeridos" }, { status: 400 });
  }

  const outboundUrl = process.env.N8N_CONVERSATIONS_OUTBOUND_URL;
  if (!outboundUrl) {
    return NextResponse.json({ message: "N8N_CONVERSATIONS_OUTBOUND_URL no configurado" }, { status: 500 });
  }

  // Buscar session_id para logging (opcional, no bloquea si no existe)
  let sessionId = null;
  try {
    const phoneClean = phone.replace(/\D/g, "");
    const [sessions] = await db.query(
      `SELECT id FROM conversation_sessions
       WHERE REPLACE(REPLACE(REPLACE(phone, '+', ''), ' ', ''), '-', '') = ?
       ORDER BY updated_at DESC LIMIT 1`,
      [phoneClean]
    );
    sessionId = sessions[0]?.id || null;
  } catch (_) {}

  // Enviar directamente al webhook de salida de n8n (igual que el resto del CRM)
  try {
    const res = await fetch(outboundUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, text: message, source_channel: channel, source: "ventas_ia", session_id: sessionId }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json({ ok: false, error: `n8n ${res.status}: ${text}` }, { status: 502 });
    }

    return NextResponse.json({ ok: true, session_id: sessionId });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 502 });
  }
}
