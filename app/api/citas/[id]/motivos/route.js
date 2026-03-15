import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/* =========================
   GET: listar motivos de una cita
========================= */
export async function GET(req, context) {
  try {
    const { id } = await context.params;

    const [rows] = await db.query(
      `
      SELECT
        cm.id,
        cm.cita_id,
        cm.motivo_id,
        cm.submotivo_id,
        m.nombre AS motivo,
        sm.nombre AS submotivo
      FROM cita_motivos cm
      JOIN motivos_citas m ON m.id = cm.motivo_id
      LEFT JOIN submotivos_citas sm ON sm.id = cm.submotivo_id
      WHERE cm.cita_id = ?
      ORDER BY cm.id ASC
      `,
      [id]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("ERROR GET MOTIVOS:", error);
    return NextResponse.json(
      { message: "Error obteniendo motivos" },
      { status: 500 }
    );
  }
}

/* =========================
   POST: agregar un motivo a la cita
========================= */
export async function POST(req, context) {
  try {
    const { id } = await context.params;
    const citaId = Number(id);

    const body = await req.json();
    const { motivo_id, submotivo_id } = body;

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
      [citaId, Number(motivo_id), submotivo_id ? Number(submotivo_id) : null]
    );

    return NextResponse.json({
      message: "Motivo guardado",
      id: result.insertId,
    });
  } catch (error) {
    console.error("ERROR POST MOTIVOS:", error);
    return NextResponse.json(
      {
        message: "Error guardando motivo",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/* =========================
   PUT: reemplazar todos los motivos de la cita
   body: [{ motivo_id, submotivo_id }, ...]
========================= */
export async function PUT(req, context) {
  let connection;

  try {
    const { id } = await context.params;
    const citaId = Number(id);
    const body = await req.json();

    if (!citaId) {
      return NextResponse.json(
        { message: "cita_id inválido" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { message: "El body debe ser un array de motivos" },
        { status: 400 }
      );
    }

    const motivos = body
      .map((item) => ({
        motivo_id: item?.motivo_id ? Number(item.motivo_id) : null,
        submotivo_id: item?.submotivo_id ? Number(item.submotivo_id) : null,
      }))
      .filter((item) => item.motivo_id);

    connection = await db.getConnection();
    await connection.beginTransaction();

    // borrar todos los anteriores
    await connection.query(
      `DELETE FROM cita_motivos WHERE cita_id = ?`,
      [citaId]
    );

    // insertar los nuevos
    for (const item of motivos) {
      await connection.query(
        `
        INSERT INTO cita_motivos (
          cita_id,
          motivo_id,
          submotivo_id
        ) VALUES (?, ?, ?)
        `,
        [citaId, item.motivo_id, item.submotivo_id]
      );
    }

    await connection.commit();

    return NextResponse.json({
      message: "Motivos actualizados",
      total: motivos.length,
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("ERROR PUT MOTIVOS:", error);
    return NextResponse.json(
      {
        message: "Error actualizando motivos",
        error: error.message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

/* =========================
   DELETE: eliminar todos los motivos de la cita
========================= */
export async function DELETE(req, context) {
  try {
    const { id } = await context.params;
    const citaId = Number(id);

    if (!citaId) {
      return NextResponse.json(
        { message: "cita_id inválido" },
        { status: 400 }
      );
    }

    await db.query(`DELETE FROM cita_motivos WHERE cita_id = ?`, [citaId]);

    return NextResponse.json({
      message: "Motivos eliminados",
    });
  } catch (error) {
    console.error("ERROR DELETE MOTIVOS:", error);
    return NextResponse.json(
      {
        message: "Error eliminando motivos",
        error: error.message,
      },
      { status: 500 }
    );
  }
}