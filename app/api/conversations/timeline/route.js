import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizeConversation } from "@/lib/conversationsAuth";

function isMissingColumnError(error) {
  return error?.code === "ER_BAD_FIELD_ERROR" || error?.errno === 1054;
}

// GET /api/conversations/timeline?session_id=1
export async function GET(req) {
  const auth = authorizeConversation(req, "view");
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { message: "session_id es requerido" },
        { status: 400 }
      );
    }

    try {
      const [rows] = await db.query(
        `
        SELECT 
          al.id,
          al.created_at,
          al.request_text AS pregunta,
          al.response_text AS respuesta,
          al.message_direction,
          al.message_status,
          al.source_channel,
          al.external_message_id,
          al.action_type,
          al.intent,
          al.success,
          al.error_message,
          cs.conversation_summary as resumen
        FROM agent_actions_log al
        JOIN conversation_sessions cs ON al.session_id = cs.id
        WHERE al.session_id = ?
        ORDER BY al.id
        `,
        [sessionId]
      );

      return NextResponse.json(rows);
    } catch (error) {
      if (!isMissingColumnError(error)) throw error;

      const [legacyRows] = await db.query(
        `
        SELECT 
          al.id,
          al.created_at,
          al.request_text AS pregunta,
          al.response_text AS respuesta,
          NULL AS message_direction,
          NULL AS message_status,
          NULL AS source_channel,
          NULL AS external_message_id,
          al.action_type,
          al.intent,
          al.success,
          al.error_message,
          cs.conversation_summary as resumen
        FROM agent_actions_log al
        JOIN conversation_sessions cs ON al.session_id = cs.id
        WHERE al.session_id = ?
        ORDER BY al.id
        `,
        [sessionId]
      );

      return NextResponse.json(legacyRows);
    }
  } catch (error) {
    console.error("❌ ERROR timeline:", error);
    return NextResponse.json(
      { message: "Error cargando timeline" },
      { status: 500 }
    );
  }
}
