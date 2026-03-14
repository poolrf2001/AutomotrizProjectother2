import { NextResponse } from "next/server";
import { authorizeConversation } from "@/lib/conversationsAuth";
import { processPendingOutbox } from "@/lib/conversationsOutbox";

function hasOutboxSecret(req) {
  const expected = process.env.CONVERSATIONS_OUTBOX_SECRET || "";
  if (!expected) return false;

  const provided = req.headers.get("x-conversations-outbox-secret") || "";
  return provided === expected;
}

// POST /api/conversations/outbox/process
// Body opcional:
// {
//   limit: number
// }
export async function POST(req) {
  const internalAccess = hasOutboxSecret(req);
  if (!internalAccess) {
    const auth = authorizeConversation(req, "edit");
    if (!auth.ok) return auth.response;
  }

  try {
    let limit = 20;

    try {
      const body = await req.json();
      limit = Number(body?.limit) || limit;
    } catch {
      // Body opcional; si no hay JSON válido se usa default.
    }

    const result = await processPendingOutbox(limit);

    return NextResponse.json({
      message: "Outbox procesado",
      ...result,
      mode: internalAccess ? "secret" : "auth",
    });
  } catch (error) {
    console.error("❌ ERROR outbox process:", error);
    return NextResponse.json(
      { message: "Error procesando outbox" },
      { status: 500 }
    );
  }
}
