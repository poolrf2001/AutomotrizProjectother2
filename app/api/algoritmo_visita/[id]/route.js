"use server";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function normalizeAnios(anios) {
  if (Array.isArray(anios)) {
    return JSON.stringify(anios);
  }

  if (typeof anios === "string") {
    try {
      const parsed = JSON.parse(anios);
      if (Array.isArray(parsed)) {
        return JSON.stringify(parsed);
      }
    } catch {
      // si ya viene como texto normal, lo guardamos tal cual
    }
    return anios;
  }

  return JSON.stringify([]);
}

// ============================
// GET ONE
// ============================
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const [rows] = await db.query(
      `
      SELECT id, modelo_id, marca_id, kilometraje, meses, años
      FROM algoritmo_visita
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) {
      return NextResponse.json({ message: "No encontrado" }, { status: 404 });
    }

    const row = rows[0];

    let aniosParsed = row.años;
    if (typeof aniosParsed === "string") {
      try {
        aniosParsed = JSON.parse(aniosParsed);
      } catch {
        aniosParsed = aniosParsed
          ? aniosParsed.split(",").map((x) => x.trim()).filter(Boolean)
          : [];
      }
    }

    return NextResponse.json({
      ...row,
      años: Array.isArray(aniosParsed) ? aniosParsed : [],
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Error al obtener el registro" },
      { status: 500 }
    );
  }
}

// ============================
// UPDATE
// body: { modelo_id, marca_id, kilometraje, meses, años }
// ============================
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { modelo_id, marca_id, kilometraje, meses, años } = body;

    if (!modelo_id || !marca_id || !kilometraje || !meses || !años) {
      return NextResponse.json(
        { message: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    const aniosToSave = normalizeAnios(años);

    const [result] = await db.query(
      `
      UPDATE algoritmo_visita
      SET modelo_id = ?, marca_id = ?, kilometraje = ?, meses = ?, años = ?
      WHERE id = ?
      `,
      [modelo_id, marca_id, kilometraje, meses, aniosToSave, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "No encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Registro actualizado con éxito" });
  } catch (error) {
    console.log(error);

    if (error?.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { message: "Ya existe un registro con estos datos." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Error al actualizar el registro" },
      { status: 500 }
    );
  }
}

// ============================
// DELETE
// ============================
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    const [result] = await db.query(
      `
      DELETE FROM algoritmo_visita
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "No encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Registro eliminado con éxito" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Error al eliminar el registro" },
      { status: 500 }
    );
  }
}