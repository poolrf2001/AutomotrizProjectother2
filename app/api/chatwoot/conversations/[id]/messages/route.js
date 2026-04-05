import { NextResponse } from "next/server";
import { getMessages, sendMessage } from "@/lib/chatwoot";
import { authorizeConversation } from "@/lib/conversationsAuth";

export async function GET(req, { params }) {
  const auth = authorizeConversation(req, "view");
  if (!auth.ok) return auth.response;

  try {
    const data = await getMessages(params.id);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error al obtener mensajes:", err);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const auth = authorizeConversation(req, "edit");
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const { content, private: isPrivate = false } = body;

  if (!content?.trim()) {
    return NextResponse.json({ message: "content requerido" }, { status: 400 });
  }

  try {
    const data = await sendMessage(params.id, content, { private: isPrivate });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error al enviar mensaje:", err);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
