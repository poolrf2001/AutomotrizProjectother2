import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    // Obtener reserva
    const [reservas] = await db.query(
      `SELECT r.*, u.fullname as created_by_name
       FROM reservas r
       LEFT JOIN usuarios u ON r.created_by = u.id
       WHERE r.id = ?`,
      [id]
    );

    if (reservas.length === 0) {
      return NextResponse.json(
        { message: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    const reserva = reservas[0];

    // Obtener detalles
    const [detalles] = await db.query(
      `SELECT rd.*, c.marca, c.modelo, c.anio
       FROM reserva_detalles rd
       LEFT JOIN cotizacionesagenda c ON rd.cotizacion_id = c.id
       join reservas r ON rd.reserva_id = r.id
       join oportunidades o ON r.oportunidad_id = o.id
       join clientes cl ON o.cliente_id = cl.id
       join marcas m ON c.marca_id = m.id
       join modelos mo ON c.modelo_id = mo.id
       WHERE rd.reserva_id = ?
       ORDER BY rd.created_at ASC`,
      [id]
    );

    // Obtener firmas
    const [firmas] = await db.query(
      `SELECT rf.*, u.fullname as usuario_nombre, cl.nombre as cliente_nombre
       FROM reserva_firmas rf
       LEFT JOIN usuarios u ON rf.usuario_id = u.id
       LEFT JOIN clientes cl ON rf.cliente_id = cl.id
       WHERE rf.reserva_id = ?
       ORDER BY rf.created_at ASC`,
      [id]
    );

    // Obtener historial
    const [historial] = await db.query(
      `SELECT rh.*, u.fullname
       FROM reserva_historial rh
       LEFT JOIN usuarios u ON rh.usuario_id = u.id
       WHERE rh.reserva_id = ?
       ORDER BY rh.created_at DESC`,
      [id]
    );

    return NextResponse.json({
      ...reserva,
      detalles,
      firmas,
      historial,
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ message: "Error: " + e.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { estado, observaciones } = await req.json();

    await db.query(
      `UPDATE reservas 
       SET estado = ?, observaciones = ?, updated_at = NOW()
       WHERE id = ?`,
      [estado, observaciones, id]
    );

    return NextResponse.json({ message: "Reserva actualizada" });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ message: "Error: " + e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    await db.query("DELETE FROM reservas WHERE id = ?", [id]);

    return NextResponse.json({ message: "Reserva eliminada" });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ message: "Error: " + e.message }, { status: 500 });
  }
}