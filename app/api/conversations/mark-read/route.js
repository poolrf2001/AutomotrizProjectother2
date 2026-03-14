import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizeConversation } from "@/lib/conversationsAuth";

function isMissingColumnError(error) {
  return error?.code === "ER_BAD_FIELD_ERROR" || error?.errno === 1054;
}

// POST /api/conversations/mark-read
// Body:
// {
//   session_id: number,
//   last_message_id?: number
// }
export async function POST(req) {
  const auth = authorizeConversation(req, "edit");
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const sessionId = Number(body?.session_id);
    let lastMessageId = Number(body?.last_message_id) || null;

    if (!sessionId || Number.isNaN(sessionId)) {
      return NextResponse.json({ message: "session_id inválido" }, { status: 400 });
    }

    const [sessions] = await db.query(
      `
      SELECT id
      FROM conversation_sessions
      WHERE id = ?
      LIMIT 1
      `,
      [sessionId]
    );

    if (!sessions?.[0]) {
      return NextResponse.json({ message: "Sesión no encontrada" }, { status: 404 });
    }

    if (!lastMessageId) {
      const [rows] = await db.query(
        `
        SELECT MAX(id) AS max_id
        FROM agent_actions_log
        WHERE session_id = ?
          AND (
            message_direction = 'inbound'
            OR (
              message_direction IS NULL
              AND request_text IS NOT NULL
              AND request_text <> ''
            )
          )
        `,
        [sessionId]
      );

      lastMessageId = rows?.[0]?.max_id || 0;
    }

    try {
      await db.query(
        `
        UPDATE conversation_sessions
        SET
          last_read_message_id = GREATEST(COALESCE(last_read_message_id, 0), ?),
          last_read_at = NOW()
        WHERE id = ?
        `,
        [lastMessageId, sessionId]
      );

      return NextResponse.json({
        message: "Conversación marcada como leída",
        session_id: sessionId,
        last_read_message_id: lastMessageId,
        tracking_enabled: true,
      });
    } catch (error) {
      if (!isMissingColumnError(error)) throw error;

      return NextResponse.json({
        message: "Migración pendiente para tracking de lectura",
        session_id: sessionId,
        last_read_message_id: 0,
        tracking_enabled: false,
      });
    }
  } catch (error) {
    console.error("❌ ERROR mark-read:", error);
    return NextResponse.json(
      { message: "Error marcando conversación como leída" },
      { status: 500 }
    );
  }
}
