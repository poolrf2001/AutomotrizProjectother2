import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getConversations } from "@/lib/chatwoot";
import { authorizeConversation } from "@/lib/conversationsAuth";

async function resolveTeamId(decoded) {
  const role = String(decoded?.role || "").toLowerCase();
  if (role.includes("admin")) return { teamId: null, isAdmin: true };

  try {
    const [rows] = await db.query(
      `SELECT rcm.chatwoot_team_id
       FROM roles_chatwoot_mapping rcm
       JOIN roles r ON r.id = rcm.role_id
       WHERE LOWER(r.name) = LOWER(?)
       LIMIT 1`,
      [decoded.role || ""]
    );
    return { teamId: rows[0]?.chatwoot_team_id ?? null, isAdmin: false };
  } catch (err) {
    console.error("[conversations GET] error resolviendo equipo:", err.message);
    return { teamId: null, isAdmin: false };
  }
}

export async function GET(req) {
  const auth = authorizeConversation(req, "view");
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status") || "open";
  const inboxId = searchParams.get("inbox_id") ?? undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);

  const allowed = ["open", "resolved", "pending", "snoozed"];
  if (!allowed.includes(statusParam)) {
    return NextResponse.json(
      { message: `status debe ser uno de: ${allowed.join(", ")}` },
      { status: 400 }
    );
  }

  const explicitTeamId = searchParams.get("team_id") ?? null;
  const { teamId: resolvedTeamId, isAdmin } = await resolveTeamId(auth.user);

  // Si no es admin y no tiene equipo mapeado y no pidió team_id explícito → sin acceso
  if (!isAdmin && resolvedTeamId === null && !explicitTeamId) {
    console.warn(`[conversations GET] usuario sin equipo mapeado: role="${auth.user?.role}"`);
    return NextResponse.json({ data: [], meta: { all_count: 0, assigned_count: 0, unassigned_count: 0 } });
  }

  const teamId = explicitTeamId ?? resolvedTeamId?.toString() ?? undefined;

  try {
    const data = await getConversations({
      status: statusParam,
      inboxId,
      teamId,
      page,
    });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error al obtener conversaciones:", err);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
