import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET(req, context) {
  const { id } = await context.params;

  const [rows] = await db.query(`
    SELECT cm.*, m.nombre AS motivo, sm.nombre AS submotivo
    FROM cita_motivos cm
    JOIN motivos_citas m ON m.id=cm.motivo_id
    LEFT JOIN submotivos_citas sm ON sm.id=cm.submotivo_id
    WHERE cm.cita_id=?
  `,[id]);

  return Response.json(rows);
}


export async function POST(req, context) {
  try {
    const { id } = await context.params;
    const citaId = Number(id);

    const body = await req.json();
    const { motivo_id, submotivo_id } = body;

    console.log("ID PARAM:", id);
    console.log("BODY:", body);

    const missing = [];
    if (!citaId) missing.push("cita_id");
    if (!motivo_id) missing.push("motivo_id");

    if (missing.length > 0) {
      return NextResponse.json(
        {
          message: "Datos incompletos",
          missing,
          received: {
            cita_id: citaId || null,
            motivo_id,
            submotivo_id,
          },
        },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      `
      INSERT INTO cita_motivos (
        cita_id,
        motivo_id,
        submotivo_id
      ) VALUES (?, ?, ?)
      `,
      [citaId, motivo_id, submotivo_id || null]
    );

    return NextResponse.json({
      message: "Motivo guardado",
      id: result.insertId,
    });
  } catch (error) {
    console.error("ERROR API MOTIVOS:", error);
    return NextResponse.json(
      {
        message: "Error guardando motivo",
        error: error.message,
      },
      { status: 500 }
    );
  }
}