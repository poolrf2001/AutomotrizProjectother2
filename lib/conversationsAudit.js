import { db } from "@/lib/db";

function isMissingTableError(error) {
  return error?.code === "ER_NO_SUCH_TABLE" || error?.errno === 1146;
}

function normalizeValue(value) {
  if (value === undefined) return null;
  if (value === null) return null;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export async function logConversationAudit({
  sessionId,
  actionType,
  actorUserId,
  actorRole,
  changes,
  metadata,
}) {
  try {
    await db.query(
      `
      INSERT INTO conversation_audit_log (
        session_id,
        action_type,
        actor_user_id,
        actor_role,
        changes_json,
        metadata_json,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        sessionId,
        actionType,
        actorUserId || null,
        actorRole || null,
        changes ? JSON.stringify(changes) : null,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );

    return { logged: true };
  } catch (error) {
    if (isMissingTableError(error)) {
      return { logged: false, reason: "Tabla conversation_audit_log no existe" };
    }
    throw error;
  }
}

export function buildFieldChange(name, before, after) {
  const b = normalizeValue(before);
  const a = normalizeValue(after);

  if (b === a) return null;

  return {
    field: name,
    before,
    after,
  };
}
