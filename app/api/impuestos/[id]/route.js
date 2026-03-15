import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req, { params }) {
  try {
    const { id } = params;

    const [rows] = await db.query(
      `
      SELECT * FROM impuestos
      WHERE id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "Impuesto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (e) {
    console.log(e);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { nombre, porcentaje, is_active } = await req.json();

    if (!nombre || porcentaje === undefined || porcentaje === null) {
      return NextResponse.json(
        { message: "Nombre y porcentaje son requeridos" },
        { status: 400 }
      );
    }

    await db.query(
      `
      UPDATE impuestos
      SET nombre = ?, porcentaje = ?, is_active = ?
      WHERE id = ?
      `,
      [nombre, porcentaje, is_active ?? 1, id]
    );

    return NextResponse.json({ message: "Impuesto actualizado" });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    await db.query(
      `
      DELETE FROM impuestos
      WHERE id = ?
      `,
      [id]
    );

    return NextResponse.json({ message: "Impuesto eliminado" });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}