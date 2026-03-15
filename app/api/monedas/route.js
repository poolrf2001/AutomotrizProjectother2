import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT * FROM monedas
      ORDER BY nombre ASC
    `);

    return NextResponse.json(rows);
  } catch (e) {
    console.log(e);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { codigo, nombre, simbolo, is_active } = await req.json();

    if (!codigo || !nombre || !simbolo) {
      return NextResponse.json(
        { message: "Código, nombre y símbolo son requeridos" },
        { status: 400 }
      );
    }

    await db.query(
      `
      INSERT INTO monedas (codigo, nombre, simbolo, is_active)
      VALUES (?, ?, ?, ?)
      `,
      [codigo, nombre, simbolo, is_active ?? 1]
    );

    return NextResponse.json({ message: "Moneda creada" });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}