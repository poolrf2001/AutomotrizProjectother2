import { NextResponse } from "next/server";
import { db } from "@/lib/db";


// ================= GET TODOS =================
export async function GET() {

  const [rows] = await db.query(`
    SELECT 
      p.*,
      ti.nombre AS tipo_nombre
    FROM productos p
    LEFT JOIN tipo_inventario ti ON p.tipo_inventario_id = ti.id
    ORDER BY p.created_at DESC
  `);

  return NextResponse.json(rows);
}


// ================= CREAR =================
export async function POST(req) {

  try {

    const body = await req.json();

    const {
      numero_parte,
      descripcion,
      tipo_inventario_id,
      fecha_ingreso,
      precio_compra,
      precio_venta
    } = body;

    const [result] = await db.query(`
      INSERT INTO productos (
        numero_parte,
        descripcion,
        tipo_inventario_id,
        fecha_ingreso,
        stock_total,
        stock_usado,
        stock_disponible,
        precio_compra,
        precio_venta
      )
      VALUES (?, ?, ?, ?, 0, 0, 0, ?, ?)
    `, [
      numero_parte,
      descripcion,
      tipo_inventario_id,
      fecha_ingreso,
      precio_compra,
      precio_venta
    ]);

    return NextResponse.json({
      message: "Producto creado",
      id: result.insertId
    });

  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
