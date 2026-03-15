#!/usr/bin/env node

function toInt(value, fallback) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return parsed;
}

async function main() {
  const endpoint = process.env.OUTBOX_PROCESS_URL || "http://localhost:3000/api/conversations/outbox/process";
  const secret = process.env.CONVERSATIONS_OUTBOX_SECRET || "";
  const limit = Math.max(1, Math.min(toInt(process.env.OUTBOX_PROCESS_LIMIT, 20), 100));

  if (!secret) {
    console.error("Falta CONVERSATIONS_OUTBOX_SECRET en variables de entorno");
    process.exit(1);
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-conversations-outbox-secret": secret,
    },
    body: JSON.stringify({ limit }),
  });

  let payload = {};
  try {
    payload = await res.json();
  } catch {
    payload = { message: "Respuesta no JSON" };
  }

  if (!res.ok) {
    console.error("Error procesando outbox:", res.status, payload);
    process.exit(1);
  }

  const processed = payload?.processed ?? 0;
  const results = Array.isArray(payload?.results) ? payload.results : [];
  const sent = results.filter((r) => r?.status === "sent").length;
  const retrying = results.filter((r) => r?.status === "retrying").length;
  const failed = results.filter((r) => r?.status === "failed").length;

  console.log(
    JSON.stringify(
      {
        message: "Outbox procesado",
        endpoint,
        processed,
        sent,
        retrying,
        failed,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("Fallo inesperado:", error);
  process.exit(1);
});
