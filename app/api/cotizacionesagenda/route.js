// ============================================
// API DE COTIZACIONES AGENDA - PRINCIPAL
// archivo: app/api/cotizacionesagenda/route.js
// ============================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const oportunidad_id = searchParams.get("oportunidad_id");
    const estado = searchParams.get("estado");
    const marca_id = searchParams.get("marca_id");
    const modelo_id = searchParams.get("modelo_id");

    let query = `
      SELECT 
        ca.*,
        m.name as marca,
        mo.name as modelo
      FROM cotizacionesagenda ca
      INNER JOIN marcas m ON m.id = ca.marca_id
      INNER JOIN modelos mo ON mo.id = ca.modelo_id
      WHERE 1=1
    `;
    const params = [];

    if (oportunidad_id) {
      query += " AND ca.oportunidad_id = ?";
      params.push(oportunidad_id);
    }

    if (estado) {
      query += " AND ca.estado = ?";
      params.push(estado);
    }

    if (marca_id) {
      query += " AND ca.marca_id = ?";
      params.push(marca_id);
    }

    if (modelo_id) {
      query += " AND ca.modelo_id = ?";
      params.push(modelo_id);
    }

    query += " ORDER BY ca.created_at DESC";

    console.log("Query:", query);
    console.log("Params:", params);

    const [rows] = await db.query(query, params);

    console.log("Resultados:", rows);

    return NextResponse.json(rows);
  } catch (e) {
    console.log("Error en GET cotizacionesagenda:", e);
    return NextResponse.json(
      { message: "Error obteniendo cotizaciones", error: e.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      oportunidad_id,
      marca_id,
      modelo_id,
      version_id,
      anio,
      sku,
      color_externo,
      color_interno,
      estado,
      created_by,
    } = body;

    console.log("Datos recibidos:", body);

    // Validar campos requeridos
    if (!oportunidad_id || !marca_id || !modelo_id) {
      return NextResponse.json(
        { message: "Campos requeridos: oportunidad_id, marca_id, modelo_id" },
        { status: 400 }
      );
    }

    if (!created_by) {
      return NextResponse.json(
        { message: "Campos requeridos: created_by" },
        { status: 400 }
      );
    }

    // Verificar que la oportunidad existe
    const [oportunidad] = await db.query(
      "SELECT id FROM oportunidades WHERE id = ?",
      [oportunidad_id]
    );

    if (oportunidad.length === 0) {
      return NextResponse.json(
        { message: "Oportunidad no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que la marca existe
    const [marca] = await db.query(
      "SELECT id FROM marcas WHERE id = ?",
      [marca_id]
    );

    if (marca.length === 0) {
      return NextResponse.json(
        { message: "Marca no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que el modelo existe
    const [modelo] = await db.query(
      "SELECT id FROM modelos WHERE id = ?",
      [modelo_id]
    );

    if (modelo.length === 0) {
      return NextResponse.json(
        { message: "Modelo no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el usuario existe
    const [usuario] = await db.query(
      "SELECT id FROM usuarios WHERE id = ?",
      [created_by]
    );

    if (usuario.length === 0) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Insertar cotización de agenda
    const [result] = await db.query(
      `INSERT INTO cotizacionesagenda 
       (oportunidad_id, marca_id, modelo_id, version_id, anio, sku, color_externo, color_interno, estado, created_by)
       VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        oportunidad_id,
        marca_id,
        modelo_id,
        version_id || null,
        anio || null,
        sku || null,
        color_externo || null,
        color_interno || null,
        estado || "borrador",
        created_by,
      ]
    );

    console.log("Cotización insertada con ID:", result.insertId);

    return NextResponse.json(
      { message: "Cotización de agenda creada", id: result.insertId },
      { status: 201 }
    );
  } catch (e) {
    console.log("Error en POST cotizacionesagenda:", e);
    return NextResponse.json(
      { message: "Error creando cotización de agenda", error: e.message },
      { status: 500 }
    );
  }
}