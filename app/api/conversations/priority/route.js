import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizeConversation } from "@/lib/conversationsAuth";
import { buildFieldChange, logConversationAudit } from "@/lib/conversationsAudit";

function isMissingColumnError(error) {
  return error?.code === "ER_BAD_FIELD_ERROR" || error?.errno === 1054;
}

const allowedPriorities = new Set(["low", "normal", "high", "urgent"]);

// POST /api/conversations/priority
// Body:
// {
//   session_id: number,
//   priority_level?: "low" | "normal" | "high" | "urgent",
//   sla_due_at?: string | null
// }
export async function POST(req) {
  const auth = authorizeConversation(req, "edit");
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();

    const sessionId = Number(body?.session_id);
    const priorityLevel = String(body?.priority_level || "normal").toLowerCase();
    const slaDueAt = body?.sla_due_at ?? null;

    if (!sessionId || Number.isNaN(sessionId)) {
      return NextResponse.json({ message: "session_id inválido" }, { status: 400 });
    }

    if (!allowedPriorities.has(priorityLevel)) {
      return NextResponse.json({ message: "priority_level inválido" }, { status: 400 });
    }

    const [sessions] = await db.query(
      `
      SELECT id, priority_level, sla_due_at
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

    try {
      await db.query(
        `
        UPDATE conversation_sessions
        SET
          priority_level = ?,
          sla_due_at = ?,
          updated_at = NOW()
        WHERE id = ?
        `,
        [priorityLevel, slaDueAt, sessionId]
      );

      const changes = [
        buildFieldChange("priority_level", current.priority_level, priorityLevel),
        buildFieldChange("sla_due_at", current.sla_due_at, slaDueAt),
      ].filter(Boolean);

      if (changes.length > 0) {
        await logConversationAudit({
          sessionId,
          actionType: "priority_update",
          actorUserId: auth?.user?.id,
          actorRole: auth?.user?.role,
          changes,
          metadata: { source: "api/conversations/priority" },
        });
      }

      return NextResponse.json({
        message: "Prioridad actualizada",
        session_id: sessionId,
        priority_level: priorityLevel,
        sla_due_at: slaDueAt,
        tracking_enabled: true,
      });
    } catch (error) {
      if (!isMissingColumnError(error)) throw error;

      return NextResponse.json({
        message: "Migración pendiente para prioridad/SLA",
        session_id: sessionId,
        priority_level: "normal",
        sla_due_at: null,
        tracking_enabled: false,
      });
    }
  } catch (error) {
    console.error("❌ ERROR priority conversation:", error);
    return NextResponse.json(
      { message: "Error actualizando prioridad" },
      { status: 500 }
    );
  }
}
