import { NextResponse } from "next/server";
import { assignConversation } from "@/lib/chatwoot";
import { authorizeConversation } from "@/lib/conversationsAuth";

export async function POST(req, { params }) {
  const auth = authorizeConversation(req, "edit");
  if (!auth.ok) return auth.response;

  const { agent_id, team_id } = await req.json();

  try {
    const data = await assignConversation(params.id, { agentId: agent_id, teamId: team_id });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error al asignar conversación:", err);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
