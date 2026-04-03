import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authorizeConversation } from "@/lib/conversationsAuth";

const AGENT_KEYS_VALIDOS = ["taller", "ventas"];
const MAX_TEXTO_LENGTH = 1000;
const CATEGORIAS_VALIDAS = ["Promoción", "Restricción", "Horario", "Protocolo", "Otro"];

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions?/i,
  /forget\s+(all\s+)?(previous\s+)?instructions?/i,
  /you\s+are\s+now\s+(a\s+)?/i,
  /act\s+as\s+(a\s+|if\s+)/i,
  /\bsystem\s*:\s*/i,
  /\bDAN\b/,
  /jailbreak/i,
];

function detectInjection(text) {
  if (!text) return null;
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) return pattern.toString();
  }
  return null;
}

// GET /api/agentes/instrucciones?agent=taller
export async function GET(req) {
  const auth = authorizeConversation(req, "view");
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const agentKey = searchParams.get("agent");

  if (!agentKey || !AGENT_KEYS_VALIDOS.includes(agentKey)) {
    return NextResponse.json({ message: "agent_key inválido" }, { status: 400 });
  }

  try {
    const [rows] = await db.query(
      `SELECT id, agent_key, texto, categoria, es_activa, vigencia_hasta,
              agregada_por, agregada_at, desactivada_por, desactivada_at
       FROM agent_instrucciones
       WHERE agent_key = ?
       ORDER BY agregada_at DESC`,
      [agentKey]
    );
    return NextResponse.json({ instrucciones: rows });
  } catch (err) {
    console.error("[GET instrucciones]", err);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

// POST /api/agentes/instrucciones
export async function POST(req) {
  const auth = authorizeConversation(req, "edit");
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => ({}));
  const { agent_key, texto, categoria, vigencia_hasta } = body;

  if (!agent_key || !AGENT_KEYS_VALIDOS.includes(agent_key)) {
    return NextResponse.json({ message: "agent_key inválido" }, { status: 400 });
  }

  if (!texto || typeof texto !== "string" || !texto.trim()) {
    return NextResponse.json({ message: "El texto de la instrucción es requerido" }, { status: 400 });
  }

  if (texto.length > MAX_TEXTO_LENGTH) {
    return NextResponse.json(
      { message: `La instrucción no puede superar ${MAX_TEXTO_LENGTH} caracteres` },
      { status: 400 }
    );
  }

  const injectionMatch = detectInjection(texto);
  if (injectionMatch) {
    console.warn(`[instrucciones POST] Posible prompt injection por ${auth.user?.email} en agent_key=${agent_key}`);
    return NextResponse.json(
      { message: "El contenido contiene patrones no permitidos" },
      { status: 400 }
    );
  }

  const agregadaPor = auth.user?.email || auth.user?.username || "crm_user";
  const textoLimpio = texto.trim();
  const categoriaLimpia = typeof categoria === "string" ? categoria.trim() || null : null;
  if (categoriaLimpia && !CATEGORIAS_VALIDAS.includes(categoriaLimpia)) {
    return NextResponse.json({ message: "Categoría inválida" }, { status: 400 });
  }
  const vigenciaLimpia = vigencia_hasta || null;

  try {
    const [result] = await db.query(
      `INSERT INTO agent_instrucciones (agent_key, texto, categoria, vigencia_hasta, agregada_por)
       VALUES (?, ?, ?, ?, ?)`,
      [agent_key, textoLimpio, categoriaLimpia, vigenciaLimpia, agregadaPor]
    );
    return NextResponse.json({ message: "Instrucción agregada", id: result.insertId }, { status: 201 });
  } catch (err) {
    console.error("[POST instrucciones]", err);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

// PUT /api/agentes/instrucciones  — togglear activa/inactiva
export async function PUT(req) {
  const auth = authorizeConversation(req, "edit");
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => ({}));
  const { id, es_activa } = body;

  if (!id || typeof es_activa !== "boolean") {
    return NextResponse.json({ message: "Parámetros inválidos" }, { status: 400 });
  }

  const usuario = auth.user?.email || auth.user?.username || "crm_user";

  try {
    await db.query(
      `UPDATE agent_instrucciones
       SET es_activa       = ?,
           desactivada_por = ?,
           desactivada_at  = ?
       WHERE id = ?`,
      [
        es_activa ? 1 : 0,
        es_activa ? null : usuario,
        es_activa ? null : new Date(),
        id,
      ]
    );
    return NextResponse.json({ message: "Estado actualizado" });
  } catch (err) {
    console.error("[PATCH instrucciones]", err);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

// DELETE /api/agentes/instrucciones
export async function DELETE(req) {
  const auth = authorizeConversation(req, "edit");
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => ({}));
  const { id } = body;

  if (!id) {
    return NextResponse.json({ message: "ID requerido" }, { status: 400 });
  }

  try {
    const [check] = await db.query("SELECT id FROM agent_instrucciones WHERE id = ? LIMIT 1", [id]);
    if (!check.length) {
      return NextResponse.json({ message: "Instrucción no encontrada" }, { status: 404 });
    }
    await db.query("DELETE FROM agent_instrucciones WHERE id = ?", [id]);
    return NextResponse.json({ message: "Instrucción eliminada" });
  } catch (err) {
    console.error("[DELETE instrucciones]", err);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
