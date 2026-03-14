import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizeConversation } from "@/lib/conversationsAuth";

function isMissingColumnError(error) {
  return error?.code === "ER_BAD_FIELD_ERROR" || error?.errno === 1054;
}

// GET /api/conversations/metrics?user_id=1
export async function GET(req) {
  const auth = authorizeConversation(req, "view");
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const userId = Number(searchParams.get("user_id")) || 0;

    try {
      const [mainRows] = await db.query(
        `
        SELECT
          COUNT(*) AS total_conversations,
          SUM(CASE WHEN COALESCE(assignment_status, 'unassigned') = 'unassigned' THEN 1 ELSE 0 END) AS unassigned_conversations,
          SUM(CASE WHEN COALESCE(assignment_status, 'unassigned') <> 'closed' AND sla_due_at IS NOT NULL AND sla_due_at < NOW() THEN 1 ELSE 0 END) AS overdue_conversations,
          SUM(CASE WHEN COALESCE(assignment_status, 'unassigned') IN ('open','pending') THEN 1 ELSE 0 END) AS active_conversations,
          SUM(CASE WHEN assigned_agent_id = ? THEN 1 ELSE 0 END) AS my_conversations,
          SUM(CASE WHEN assigned_agent_id = ? AND COALESCE(assignment_status, 'unassigned') IN ('open','pending') THEN 1 ELSE 0 END) AS my_active_conversations
        FROM conversation_sessions
        `,
        [userId, userId]
      );

      const [unreadRows] = await db.query(
        `
        SELECT
          COALESCE(SUM(unread_count), 0) AS total_unread_messages
        FROM (
          SELECT
            cs.id,
            (
              SELECT COUNT(*)
              FROM agent_actions_log u
              WHERE u.session_id = cs.id
                AND u.id > COALESCE(cs.last_read_message_id, 0)
                AND (
                  u.message_direction = 'inbound'
                  OR (
                    u.message_direction IS NULL
                    AND u.request_text IS NOT NULL
                    AND u.request_text <> ''
                  )
                )
            ) AS unread_count
          FROM conversation_sessions cs
        ) t
        `
      );

      const [ftrRows] = await db.query(
        `
        SELECT
          ROUND(AVG(diff_seconds), 0) AS avg_first_response_seconds
        FROM (
          SELECT
            TIMESTAMPDIFF(
              SECOND,
              (
                SELECT MIN(al1.created_at)
                FROM agent_actions_log al1
                WHERE al1.session_id = cs.id
                  AND (
                    al1.message_direction = 'inbound'
                    OR (
                      al1.message_direction IS NULL
                      AND al1.request_text IS NOT NULL
                      AND al1.request_text <> ''
                    )
                  )
              ),
              (
                SELECT MIN(al2.created_at)
                FROM agent_actions_log al2
                WHERE al2.session_id = cs.id
                  AND (
                    al2.message_direction = 'outbound'
                    OR (
                      al2.message_direction IS NULL
                      AND al2.response_text IS NOT NULL
                      AND al2.response_text <> ''
                    )
                  )
              )
            ) AS diff_seconds
          FROM conversation_sessions cs
        ) d
        WHERE diff_seconds IS NOT NULL
          AND diff_seconds >= 0
        `
      );

      const [waitRows] = await db.query(
        `
        SELECT
          MAX(wait_seconds) AS max_wait_seconds
        FROM (
          SELECT
            TIMESTAMPDIFF(
              SECOND,
              COALESCE(cs.last_inbound_at, cs.updated_at),
              NOW()
            ) AS wait_seconds
          FROM conversation_sessions cs
          WHERE COALESCE(cs.assignment_status, 'unassigned') IN ('unassigned', 'open', 'pending')
        ) w
        WHERE wait_seconds IS NOT NULL
          AND wait_seconds >= 0
        `
      );

      return NextResponse.json({
        ...mainRows?.[0],
        ...unreadRows?.[0],
        ...ftrRows?.[0],
        ...waitRows?.[0],
        metrics_mode: "full",
      });
    } catch (error) {
      if (!isMissingColumnError(error)) throw error;

      const [legacyRows] = await db.query(
        `
        SELECT COUNT(*) AS total_conversations
        FROM conversation_sessions
        `
      );

      return NextResponse.json({
        total_conversations: legacyRows?.[0]?.total_conversations || 0,
        unassigned_conversations: 0,
        overdue_conversations: 0,
        active_conversations: 0,
        my_conversations: 0,
        my_active_conversations: 0,
        total_unread_messages: 0,
        avg_first_response_seconds: null,
        max_wait_seconds: null,
        metrics_mode: "legacy",
      });
    }
  } catch (error) {
    console.error("❌ ERROR conversations metrics:", error);
    return NextResponse.json(
      { message: "Error cargando métricas de conversaciones" },
      { status: 500 }
    );
  }
}
