import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const [rows] = await db.query(
      `SELECT a.*, m.name as marca_name, mo.name as modelo_name, mn.nombre as moneda_nombre, mn.simbolo
       FROM accesorios_disponibles a
       LEFT JOIN marcas m ON a.marca_id = m.id
       LEFT JOIN modelos mo ON a.modelo_id = mo.id
       LEFT JOIN monedas mn ON a.moneda_id = mn.id
       WHERE a.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Accesorio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "Error: " + e.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const {
      marca_id,
      modelo_id,
      detalle,
      numero_parte,
      precio,
      moneda_id,
    } = await req.json();

    if (!marca_id || !modelo_id || !detalle || !numero_parte || !precio || !moneda_id) {
      return NextResponse.json(
        { message: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    await db.query(
      `UPDATE accesorios_disponibles
       SET marca_id = ?, modelo_id = ?, detalle = ?, numero_parte = ?, precio = ?, moneda_id = ?, updated_at = NOW()
       WHERE id = ?`,
      [marca_id, modelo_id, detalle, numero_parte, precio, moneda_id, id]
    );

    return NextResponse.json({ message: "Accesorio actualizado" });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "Error: " + e.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    await db.query(
      `DELETE FROM accesorios_disponibles WHERE id = ?`,
      [id]
    );

    return NextResponse.json({ message: "Accesorio eliminado" });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "Error: " + e.message },
      { status: 500 }
    );
  }
}