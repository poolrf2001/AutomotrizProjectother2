import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/* =========================
   GET: Obtener un registro por VIN
=========================*/
export async function GET(request, { params }) {
  try {
    const { vin } = await params;

    const [rows] = await db.query(
      `
      SELECT 
        hc.vin,
        hc.marca_id,
        m.nombre as marca_nombre,
        hc.modelo_id,
        mo.nombre as modelo_nombre,
        hc.version_id,
        v.nombre as version_nombre,
        hc.numerofactura,
        hc.preciocompra,
        hc.created_at,
        hc.created_at_facturacion,
        hc.created_at_entrega,
        hc.updated_at
      FROM historial_carros hc
      LEFT JOIN marcas m ON hc.marca_id = m.id
      LEFT JOIN modelos mo ON hc.modelo_id = mo.id
      LEFT JOIN versiones v ON hc.version_id = v.id
      WHERE hc.vin = ?
      LIMIT 1
      `,
      [vin.toUpperCase()]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Registro no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error al obtener registro" },
      { status: 500 }
    );
  }
}

/* =========================
   PUT: Actualizar registro
=========================*/
export async function PUT(request, { params }) {
  try {
    const { vin } = await params;
    const body = await request.json();

    const numerofactura = body.numerofactura ? (body.numerofactura || "").trim() : null;
    const preciocompra = body.preciocompra ? parseFloat(body.preciocompra) : null;
    const createdAtFacturacion = body.created_at_facturacion || null;
    const createdAtEntrega = body.created_at_entrega || null;
    const marcaId = body.marca_id;
    const modeloId = body.modelo_id;
    const versionId = body.version_id;

    /* =========================
       VALIDACIONES
    =========================*/
    if (preciocompra !== null && preciocompra < 0) {
      return NextResponse.json(
        { message: "El precio de compra no puede ser negativo" },
        { status: 400 }
      );
    }

    // ✅ Verificar que el registro existe
    const [exists] = await db.query(
      `SELECT vin FROM historial_carros WHERE vin = ?`,
      [vin.toUpperCase()]
    );

    if (exists.length === 0) {
      return NextResponse.json(
        { message: "Registro no encontrado" },
        { status: 404 }
      );
    }

    // ✅ Si cambian marca, modelo o versión, verificar que no haya duplicado
    if (marcaId || modeloId || versionId) {
      const currentMarcaId = marcaId;
      const currentModeloId = modeloId;
      const currentVersionId = versionId;

      const [duplicate] = await db.query(
        `
        SELECT vin FROM historial_carros 
        WHERE marca_id = ? AND modelo_id = ? AND version_id = ? 
        AND vin != ?
        `,
        [currentMarcaId, currentModeloId, currentVersionId, vin.toUpperCase()]
      );

      if (duplicate.length > 0) {
        return NextResponse.json(
          { message: "Ya existe otro carro con esta combinación" },
          { status: 409 }
        );
      }
    }

    /* =========================
       UPDATE HISTORIAL
    =========================*/
    const updates = [];
    const values = [];

    if (marcaId !== undefined) {
      updates.push(`marca_id = ?`);
      values.push(marcaId);
    }
    if (modeloId !== undefined) {
      updates.push(`modelo_id = ?`);
      values.push(modeloId);
    }
    if (versionId !== undefined) {
      updates.push(`version_id = ?`);
      values.push(versionId);
    }
    if (numerofactura !== undefined) {
      updates.push(`numerofactura = ?`);
      values.push(numerofactura);
    }
    if (preciocompra !== undefined) {
      updates.push(`preciocompra = ?`);
      values.push(preciocompra);
    }
    if (createdAtFacturacion !== undefined) {
      updates.push(`created_at_facturacion = ?`);
      values.push(createdAtFacturacion);
    }
    if (createdAtEntrega !== undefined) {
      updates.push(`created_at_entrega = ?`);
      values.push(createdAtEntrega);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: "No hay datos para actualizar" },
        { status: 400 }
      );
    }

    values.push(vin.toUpperCase());

    await db.query(
      `UPDATE historial_carros SET ${updates.join(", ")} WHERE vin = ?`,
      values
    );

    return NextResponse.json({
      message: "✓ Registro actualizado exitosamente",
      vin: vin.toUpperCase(),
    });
  } catch (error) {
    console.error(error);

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return NextResponse.json(
        { message: "Una o más referencias no existen" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Error al actualizar registro" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE: Eliminar registro
=========================*/
export async function DELETE(request, { params }) {
  try {
    const { vin } = await params;

    const [exists] = await db.query(
      `SELECT vin FROM historial_carros WHERE vin = ?`,
      [vin.toUpperCase()]
    );

    if (exists.length === 0) {
      return NextResponse.json(
        { message: "Registro no encontrado" },
        { status: 404 }
      );
    }

    await db.query(
      `DELETE FROM historial_carros WHERE vin = ?`,
      [vin.toUpperCase()]
    );

    return NextResponse.json({
      message: "✓ Registro eliminado exitosamente",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error al eliminar registro" },
      { status: 500 }
    );
  }
}