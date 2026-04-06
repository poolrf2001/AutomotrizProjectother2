import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/* =========================
   GET: Estadísticas de historial
=========================*/
export async function GET(request) {
  try {
    // ✅ Total de carros
    const [totalCarros] = await db.query(
      `SELECT COUNT(*) as total FROM historial_carros`
    );

    // ✅ Total facturado
    const [totalFacturado] = await db.query(
      `SELECT SUM(preciocompra) as total FROM historial_carros WHERE preciocompra IS NOT NULL`
    );

    // ✅ Promedio de precio
    const [promedioPrice] = await db.query(
      `SELECT AVG(preciocompra) as promedio FROM historial_carros WHERE preciocompra IS NOT NULL`
    );

    // ✅ Carros por marca
    const [carrosPorMarca] = await db.query(
      `
      SELECT 
        m.id,
        m.nombre,
        COUNT(hc.vin) as cantidad,
        AVG(hc.preciocompra) as promedio_precio
      FROM marcas m
      LEFT JOIN historial_carros hc ON m.id = hc.marca_id
      GROUP BY m.id, m.nombre
      ORDER BY cantidad DESC
      `
    );

    // ✅ Carros entregados vs facturados vs pendientes
    const [estado] = await db.query(
      `
      SELECT 
        SUM(CASE WHEN created_at_entrega IS NOT NULL THEN 1 ELSE 0 END) as entregados,
        SUM(CASE WHEN created_at_facturacion IS NOT NULL THEN 1 ELSE 0 END) as facturados,
        SUM(CASE WHEN created_at_entrega IS NULL AND created_at_facturacion IS NULL THEN 1 ELSE 0 END) as pendientes
      FROM historial_carros
      `
    );

    return NextResponse.json({
      totalCarros: totalCarros[0]?.total || 0,
      totalFacturado: totalFacturado[0]?.total || 0,
      promedioPrice: promedioPrice[0]?.promedio || 0,
      carrosPorMarca,
      estado: estado[0],
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}