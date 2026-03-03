import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// PUT /api/cotizacion-tarifas/:id
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { nombre, precio_hora, activo } = await req.json();

    if (!nombre || precio_hora == null) {
      return NextResponse.json({ message: "Faltan campos requeridos" }, { status: 400 });
    }

    await db.query(
      "UPDATE cotizacion_tarifas SET nombre = ?, precio_hora = ?, activo = ? WHERE id = ?",
      [nombre.trim(), precio_hora, activo ?? 1, id]
    );

    return NextResponse.json({ message: "Tarifa actualizada" });
  } catch (error) {
    console.error("Error updating tarifa:", error);
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}

// DELETE /api/cotizacion-tarifas/:id
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    // Check if tarifa is used in any cotización
    const [used] = await db.query(
      "SELECT COUNT(*) as count FROM cotizaciones WHERE tarifa_id = ?",
      [id]
    );

    if (used[0].count > 0) {
      return NextResponse.json(
        { message: "No se puede eliminar, está siendo usada en cotizaciones" },
        { status: 400 }
      );
    }

    await db.query("DELETE FROM cotizacion_tarifas WHERE id = ?", [id]);
    return NextResponse.json({ message: "Tarifa eliminada" });
  } catch (error) {
    console.error("Error deleting tarifa:", error);
    return NextResponse.json({ message: "Error al eliminar" }, { status: 500 });
  }
}
