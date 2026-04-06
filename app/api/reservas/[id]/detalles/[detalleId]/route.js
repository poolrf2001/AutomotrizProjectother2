import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const {
      tipo_comprobante,
      fecha_nacimiento,
      ocupacion,
      domicilio,
      departamento_id,
      provincia_id,
      distrito_id,
      nombreconyugue,
      dniconyugue,
      vin,
      usovehiculo,
      numero_motor,
      dsctocredinissan,
      dsctotienda,
      dsctobonoretoma,
      dsctonper,
      glp,
      tarjetaplaca,
      flete,
      cantidad,
      precio_base,
      color_externo,
      color_interno,
      total,
      tc_referencial,
      valores_tc_ref,
      cuota_inicial,
      monto_aprobado,
      observaciones,
      descripcion,
    } = await req.json();

    // ✅ USAR observaciones O descripcion (lo que venga del frontend)
    const finalDescripcion = descripcion || observaciones || null;

    const result = await db.query(
      `UPDATE reserva_detalles 
       SET tipo_comprobante = ?,
           fecha_nacimiento = ?,
           ocupacion = ?,
           domicilio = ?,
           departamento_id = ?,
           provincia_id = ?,
           distrito_id = ?,
           nombreconyugue = ?,
           dniconyugue = ?,
           vin = ?,
           usovehiculo = ?,
           numero_motor = ?,
           dsctocredinissan = ?,
           dsctotienda = ?,
           dsctobonoretoma = ?,
           dsctonper = ?,
           glp = ?,
           tarjetaplaca = ?,
           flete = ?,
           cantidad = ?,
           precio_base = ?,
           color_externo = ?,
           color_interno = ?,
           total = ?,
           tc_referencial = ?,
           valores_tc_ref = ?,
           cuota_inicial = ?,
           monto_aprobado = ?,
           descripcion = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [
        tipo_comprobante || null,
        fecha_nacimiento || null,
        ocupacion || null,
        domicilio || null,
        departamento_id || null,
        provincia_id || null,
        distrito_id || null,
        nombreconyugue || null,
        dniconyugue || null,
        vin || null,
        usovehiculo || null,
        numero_motor || null,
        dsctocredinissan || 0,
        dsctotienda || 0,
        dsctobonoretoma || 0,
        dsctonper || 0,
        glp || 0,
        tarjetaplaca || 0,
        flete || 0,
        cantidad || 1,
        precio_base || 0,
        color_externo || null,
        color_interno || null,
        total || null,
        tc_referencial || null,
        valores_tc_ref || null,
        cuota_inicial || null,
        monto_aprobado || null,
        finalDescripcion,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Detalle no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: "Detalle actualizado exitosamente",
      id,
    });
  } catch (e) {
    console.error("Error en PUT /api/reserva-detalles/[id]:", e);
    return NextResponse.json(
      { message: "Error: " + e.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    const result = await db.query(
      `DELETE FROM reserva_detalles WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Detalle no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Detalle eliminado exitosamente" });
  } catch (e) {
    console.error("Error en DELETE /api/reserva-detalles/[id]:", e);
    return NextResponse.json(
      { message: "Error: " + e.message },
      { status: 500 }
    );
  }
}