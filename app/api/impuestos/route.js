import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT * FROM impuestos
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
    const { nombre, porcentaje, is_active } = await req.json();

    if (!nombre || porcentaje === undefined || porcentaje === null) {
      return NextResponse.json(
        { message: "Nombre y porcentaje son requeridos" },
        { status: 400 }
      );
    }

    await db.query(
      `
      INSERT INTO impuestos (nombre, porcentaje, is_active)
      VALUES (?, ?, ?)
      `,
      [nombre, porcentaje, is_active ?? 1]
    );

    return NextResponse.json({ message: "Impuesto creado" });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}