import { NextResponse } from "next/server";
import { getInboxes } from "@/lib/chatwoot";
import { authorizeConversation } from "@/lib/conversationsAuth";

export async function GET(req) {
  const auth = authorizeConversation(req, "view");
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const channelType = searchParams.get("channel_type") || null;

  try {
    const data = await getInboxes();
    let inboxes = Array.isArray(data?.payload) ? data.payload : (Array.isArray(data) ? data : []);

    if (channelType) {
      inboxes = inboxes.filter((i) => i.channel_type === channelType);
    }

    return NextResponse.json({ inboxes });
  } catch (err) {
    console.error("Error obteniendo inboxes:", err.message);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
