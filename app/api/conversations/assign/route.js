import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizeConversation } from "@/lib/conversationsAuth";
import { buildFieldChange, logConversationAudit } from "@/lib/conversationsAudit";

function isMissingColumnError(error) {
  return error?.code === "ER_BAD_FIELD_ERROR" || error?.errno === 1054;
}

const allowedStatuses = new Set(["unassigned", "open", "pending", "closed"]);

// POST /api/conversations/assign
// Body:
// {
//   session_id: number,
//   assigned_agent_id?: number | null,
//   assignment_status?: "unassigned" | "open" | "pending" | "closed"
// }
export async function POST(req) {
  const auth = authorizeConversation(req, "edit");
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();

    const sessionId = Number(body?.session_id);
    const assignedAgentId = body?.assigned_agent_id == null
      ? null
      : Number(body?.assigned_agent_id);

    let assignmentStatus = (body?.assignment_status || "").trim().toLowerCase();

    if (!sessionId || Number.isNaN(sessionId)) {
      return NextResponse.json({ message: "session_id inválido" }, { status: 400 });
    }

    if (assignedAgentId !== null && Number.isNaN(assignedAgentId)) {
      return NextResponse.json({ message: "assigned_agent_id inválido" }, { status: 400 });
    }

    if (!assignmentStatus) {
      assignmentStatus = assignedAgentId ? "open" : "unassigned";
    }

    if (!allowedStatuses.has(assignmentStatus)) {
      return NextResponse.json({ message: "assignment_status inválido" }, { status: 400 });
    }

    const [sessions] = await db.query(
      `
      SELECT id, assigned_agent_id, assignment_status
      FROM conversation_sessions
      WHERE id = ?
      LIMIT 1
      `,
      [sessionId]
    );

    if (!sessions?.[0]) {
      return NextResponse.json({ message: "Sesión no encontrada" }, { status: 404 });
    }

    const current = sessions[0];

    if (assignedAgentId) {
      const [users] = await db.query(
        `
        SELECT id
        FROM usuarios
        WHERE id = ?
        LIMIT 1
        `,
        [assignedAgentId]
      );

      if (!users?.[0]) {
        return NextResponse.json({ message: "Asesor no encontrado" }, { status: 404 });
      }
    }

    try {
      await db.query(
        `
        UPDATE conversation_sessions
        SET
          assigned_agent_id = ?,
          assignment_status = ?,
          updated_at = NOW()
        WHERE id = ?
        `,
        [assignedAgentId, assignmentStatus, sessionId]
      );

      const changes = [
        buildFieldChange("assigned_agent_id", current.assigned_agent_id, assignedAgentId),
        buildFieldChange("assignment_status", current.assignment_status, assignmentStatus),
      ].filter(Boolean);

      if (changes.length > 0) {
        await logConversationAudit({
          sessionId,
          actionType: "assignment_update",
          actorUserId: auth?.user?.id,
          actorRole: auth?.user?.role,
          changes,
          metadata: { source: "api/conversations/assign" },
        });
      }

      return NextResponse.json({
        message: "Asignación actualizada",
        session_id: sessionId,
        assigned_agent_id: assignedAgentId,
        assignment_status: assignmentStatus,
        tracking_enabled: true,
      });
    } catch (error) {
      if (!isMissingColumnError(error)) throw error;

      return NextResponse.json({
        message: "Migración pendiente para asignación",
        session_id: sessionId,
        assigned_agent_id: null,
        assignment_status: "unassigned",
        tracking_enabled: false,
      });
    }
  } catch (error) {
    console.error("❌ ERROR assign conversation:", error);
    return NextResponse.json(
      { message: "Error actualizando asignación" },
      { status: 500 }
    );
  }
}
