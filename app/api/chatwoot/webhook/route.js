import { NextResponse } from "next/server";
import { broadcastSseEvent } from "@/lib/chatwootSse";
import crypto from "crypto";

// EXCEPCIÓN DOCUMENTADA: Chatwoot envía su firma como HMAC-SHA256 en
// x-chatwoot-signature — prescrito por el vendor. Se acepta también el header
// estándar del proyecto (x-conversations-webhook-secret) como fallback.
// La validación HMAC es más segura que comparación simple de token.
function verifySignature(body, signature) {
  const secret = process.env.CONVERSATIONS_WEBHOOK_SECRET;
  if (!secret) return false; // no secret configured → reject all (fail closed)
  const hmac = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return hmac === signature;
}

export async function POST(req) {
  const rawBody = await req.text();
  // Chatwoot sends x-chatwoot-signature, but we check project standard header too
  const signature = req.headers.get("x-conversations-webhook-secret") || req.headers.get("x-chatwoot-signature") || "";

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    console.error("Chatwoot webhook JSON parse error:", err);
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.event;

  // Emitir al frontend via SSE
  if (eventType === "message_created" && event.message_type === "incoming") {
    broadcastSseEvent("new_message", {
      conversation_id: event.conversation?.id,
      inbox_id: event.inbox_id,
      contact_name: event.sender?.name,
      content: event.content,
      created_at: event.created_at,
    });
  }

  if (eventType === "conversation_created") {
    broadcastSseEvent("new_conversation", {
      conversation_id: event.id,
      inbox_id: event.inbox_id,
      contact_name: event.meta?.sender?.name,
    });
  }

  if (eventType === "conversation_status_changed") {
    broadcastSseEvent("conversation_status", {
      conversation_id: event.id,
      status: event.status,
    });
  }

  return NextResponse.json({ message: "ok" });
}
