import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/cotizacion-tarifas?tipo=mano_obra|panos
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo");

    let query = "SELECT * FROM cotizacion_tarifas";
    const params = [];

    if (tipo) {
      query += " WHERE tipo = ?";
      params.push(tipo);
    }

    query += " ORDER BY tipo, nombre";

    const [rows] = await db.query(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching tarifas:", error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST /api/cotizacion-tarifas
export async function POST(req) {
  try {
    const { tipo, nombre, precio_hora } = await req.json();

    if (!tipo || !nombre || precio_hora == null) {
      return NextResponse.json({ message: "Faltan campos requeridos" }, { status: 400 });
    }

    const [result] = await db.query(
      "INSERT INTO cotizacion_tarifas (tipo, nombre, precio_hora) VALUES (?, ?, ?)",
      [tipo, nombre.trim(), precio_hora]
    );

    return NextResponse.json({ message: "Tarifa creada", id: result.insertId });
  } catch (error) {
    console.error("Error creating tarifa:", error);
    return NextResponse.json({ message: "Error al crear tarifa" }, { status: 500 });
  }
}
