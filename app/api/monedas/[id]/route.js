import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req, { params }) {
  try {
    const { id } = params;

    const [rows] = await db.query(
      `
      SELECT * FROM monedas
      WHERE id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "Moneda no encontrada" }, { status: 404 });
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
    const { codigo, nombre, simbolo, is_active } = await req.json();

    if (!codigo || !nombre || !simbolo) {
      return NextResponse.json(
        { message: "Código, nombre y símbolo son requeridos" },
        { status: 400 }
      );
    }

    await db.query(
      `
      UPDATE monedas
      SET codigo = ?, nombre = ?, simbolo = ?, is_active = ?
      WHERE id = ?
      `,
      [codigo, nombre, simbolo, is_active ?? 1, id]
    );

    return NextResponse.json({ message: "Moneda actualizada" });
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
      DELETE FROM monedas
      WHERE id = ?
      `,
      [id]
    );

    return NextResponse.json({ message: "Moneda eliminada" });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}