import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const marca_id = searchParams.get("marca_id");
    const modelo_id = searchParams.get("modelo_id");
    const moneda_id = searchParams.get("moneda_id");

    let sql = `SELECT a.*, m.name as marca_name, mo.name as modelo_name, mn.nombre as moneda_nombre, mn.simbolo
               FROM accesorios_disponibles a
               LEFT JOIN marcas m ON a.marca_id = m.id
               LEFT JOIN modelos mo ON a.modelo_id = mo.id
               LEFT JOIN monedas mn ON a.moneda_id = mn.id
               WHERE 1=1`;

    const params = [];

    if (marca_id) {
      sql += " AND a.marca_id = ?";
      params.push(marca_id);
    }

    if (modelo_id) {
      sql += " AND a.modelo_id = ?";
      params.push(modelo_id);
    }

    if (moneda_id) {
      sql += " AND a.moneda_id = ?";
      params.push(moneda_id);
    }

    sql += " ORDER BY a.created_at DESC";

    const [rows] = await db.query(sql, params);

    return NextResponse.json(rows);
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "Error: " + e.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
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

    const [result] = await db.query(
      `INSERT INTO accesorios_disponibles (marca_id, modelo_id, detalle, numero_parte, precio, moneda_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [marca_id, modelo_id, detalle, numero_parte, precio, moneda_id]
    );

    return NextResponse.json({
      message: "Accesorio creado",
      id: result.insertId,
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "Error: " + e.message },
      { status: 500 }
    );
  }
}