import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizeConversation } from "@/lib/conversationsAuth";

const AGENT_KEYS_VALIDOS = ["taller", "ventas"];

// Autentica llamadas desde n8n via webhook secret
function authenticateWebhook(req) {
  const secret = req.headers.get("x-conversations-webhook-secret") || "";
  const expected = process.env.CONVERSATIONS_WEBHOOK_SECRET || "";
  return expected && secret === expected;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const agentKey = searchParams.get("agent");

  // Si viene con webhook secret (llamada desde n8n), responde directamente
  if (authenticateWebhook(req)) {
    if (!agentKey || !AGENT_KEYS_VALIDOS.includes(agentKey)) {
      return NextResponse.json({ consideraciones: null });
    }
    const [rows] = await db.query(
      "SELECT consideraciones FROM agent_prompt_config WHERE agent_key = ? AND is_active = 1 LIMIT 1",
      [agentKey]
    );
    return NextResponse.json({ consideraciones: rows[0]?.consideraciones || null });
  }

  // Para el CRM: requiere sesión autenticada
  const auth = authorizeConversation(req, "view");
  if (!auth.ok) return auth.response;

  if (agentKey) {
    if (!AGENT_KEYS_VALIDOS.includes(agentKey)) {
      return NextResponse.json({ message: "agent_key inválido" }, { status: 400 });
    }
    const [rows] = await db.query(
      "SELECT agent_key, display_name, consideraciones, is_active, updated_at, updated_by FROM agent_prompt_config WHERE agent_key = ? LIMIT 1",
      [agentKey]
    );
    return NextResponse.json({ agente: rows[0] || null });
  }

  const [rows] = await db.query(
    "SELECT agent_key, display_name, consideraciones, is_active, updated_at, updated_by FROM agent_prompt_config ORDER BY id ASC"
  );
  return NextResponse.json({ agentes: rows });
}

export async function PUT(req) {
  const auth = authorizeConversation(req, "edit");
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => ({}));
  const { agent_key, consideraciones } = body;

  if (!agent_key || !AGENT_KEYS_VALIDOS.includes(agent_key)) {
    return NextResponse.json({ message: "agent_key inválido" }, { status: 400 });
  }

  const texto = typeof consideraciones === "string" ? consideraciones.trim() : null;
  const updatedBy = auth.user?.email || auth.user?.username || "crm_user";

  await db.query(
    `UPDATE agent_prompt_config
     SET consideraciones = ?, updated_by = ?
     WHERE agent_key = ?`,
    [texto || null, updatedBy, agent_key]
  );

  return NextResponse.json({ message: "Configuración guardada" });
}
