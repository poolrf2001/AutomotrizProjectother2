// ============================================
// API DE PREGUNTAS DE ATENCIÓN - ID - CORREGIDA
// archivo: app/api/preguntas-atencion/[id]/route.js
// ============================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req, { params }) {
  try {
    // Esperar a que params se resuelva
    const { id } = await params;

    console.log("Obteniendo pregunta:", id);

    const [rows] = await db.query(
      `SELECT 
        pa.*
      FROM preguntas_atencion pa
      WHERE pa.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Pregunta no encontrada" },
        { status: 404 }
      );
    }

    // Parsear JSON de opciones
    const pregunta = {
      ...rows[0],
      opciones: rows[0].opciones ? JSON.parse(rows[0].opciones) : null,
    };

    return NextResponse.json(pregunta);
  } catch (e) {
    console.log("Error en GET preguntas-atencion por ID:", e);
    return NextResponse.json(
      { message: "Error obteniendo pregunta", error: e.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    // Esperar a que params se resuelva
    const { id } = await params;

    console.log("Actualizando pregunta:", id);

    const {
      pregunta,
      tipo_respuesta,
      opciones,
      es_obligatoria,
      orden,
      es_activa,
    } = await req.json();

    if (!pregunta || !tipo_respuesta) {
      return NextResponse.json(
        { message: "Pregunta y tipo_respuesta son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que exista la pregunta
    const [existing] = await db.query(
      "SELECT id FROM preguntas_atencion WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { message: "Pregunta no encontrada" },
        { status: 404 }
      );
    }

    // Preparar opciones como JSON si es necesario
    let opcionesJson = null;
    if (opciones) {
      opcionesJson = typeof opciones === "string" ? opciones : JSON.stringify(opciones);
    }

    // Actualizar pregunta
    const [result] = await db.query(
      `UPDATE preguntas_atencion 
       SET pregunta = ?, tipo_respuesta = ?, opciones = ?, es_obligatoria = ?, orden = ?, es_activa = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        pregunta,
        tipo_respuesta,
        opcionesJson,
        es_obligatoria !== undefined ? es_obligatoria : 0,
        orden || null,
        es_activa !== undefined ? es_activa : 1,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "No se pudo actualizar la pregunta" },
        { status: 400 }
      );
    }

    console.log("Pregunta actualizada");

    return NextResponse.json({
      message: "Pregunta actualizada",
      id: id,
    });
  } catch (e) {
    console.log("Error en PUT preguntas-atencion:", e);
    return NextResponse.json(
      { message: "Error actualizando pregunta", error: e.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    // Esperar a que params se resuelva
    const { id } = await params;

    console.log("Eliminando pregunta:", id);

    // Verificar que exista la pregunta
    const [existing] = await db.query(
      "SELECT id FROM preguntas_atencion WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { message: "Pregunta no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar pregunta
    const [result] = await db.query(
      "DELETE FROM preguntas_atencion WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "No se pudo eliminar la pregunta" },
        { status: 400 }
      );
    }

    console.log("Pregunta eliminada");

    return NextResponse.json({ message: "Pregunta eliminada" });
  } catch (e) {
    console.log("Error en DELETE preguntas-atencion:", e);
    return NextResponse.json(
      { message: "Error eliminando pregunta", error: e.message },
      { status: 500 }
    );
  }
}