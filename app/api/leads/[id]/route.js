import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const REGEX_LD = "^LD-[0-9]{4}-[0-9]{3}$";

/* =========================
   GET: obtener un lead
   - solo LD
========================= */
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const [rows] = await db.query(
      `
      SELECT
        o.id,
        o.oportunidad_id,
        o.oportunidad_padre_id,
        o.cliente_id,
        o.marca_id,
        o.modelo_id,
        o.origen_id,
        o.suborigen_id,
        o.detalle,
        o.etapasconversion_id,
        o.created_by,
        o.asignado_a,
        o.created_at,
        o.updated_at,

        COALESCE(c.nombre, '') AS cliente_nombre,
        COALESCE(c.apellido, '') AS cliente_apellido,
        c.email AS cliente_email,
        c.celular AS cliente_celular,
        c.identificacion_fiscal AS cliente_dni,
        
        m.name AS marca_nombre,
        mo.name AS modelo_nombre,
        oc.name AS origen_nombre,
        sc.name AS suborigen_nombre,
        ec.nombre AS etapa_nombre,
        
        u1.fullname AS creado_por_nombre,
        u2.fullname AS asignado_a_nombre,
        
        DATE_FORMAT(o.created_at, '%Y-%m-%d %H:%i:%s') AS fecha_creacion,
        DATE_FORMAT(o.updated_at, '%Y-%m-%d %H:%i:%s') AS fecha_actualizacion

      FROM oportunidades o
      LEFT JOIN clientes c ON c.id = o.cliente_id
      LEFT JOIN marcas m ON m.id = o.marca_id
      LEFT JOIN modelos mo ON mo.id = o.modelo_id
      LEFT JOIN origenes_citas oc ON oc.id = o.origen_id
      LEFT JOIN suborigenes_citas sc ON sc.id = o.suborigen_id
      LEFT JOIN etapasconversion ec ON ec.id = o.etapasconversion_id
      LEFT JOIN usuarios u1 ON u1.id = o.created_by
      LEFT JOIN usuarios u2 ON u2.id = o.asignado_a
      WHERE o.id = ?
        AND o.oportunidad_id LIKE 'LD-%'
      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) {
      return NextResponse.json(
        { message: "Lead LD no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("GET /api/leads/[id] error:", error);
    return NextResponse.json(
      {
        message: "Error al obtener lead",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/* =========================
   PUT: actualizar lead
   - solo LD
========================= */
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Validar que sea un lead LD
    const [existsCheck] = await db.query(
      `SELECT id FROM oportunidades WHERE id = ? AND oportunidad_id LIKE 'LD-%' LIMIT 1`,
      [id]
    );

    if (!existsCheck.length) {
      return NextResponse.json(
        { message: "Lead LD no encontrado" },
        { status: 404 }
      );
    }

    const cliente_id = body.cliente_id ? Number(body.cliente_id) : null;
    const marca_id = body.marca_id ? Number(body.marca_id) : null;
    const modelo_id = body.modelo_id ? Number(body.modelo_id) : null;
    const origen_id = body.origen_id ? Number(body.origen_id) : null;
    const suborigen_id = body.suborigen_id ? Number(body.suborigen_id) : null;
    const detalle = (body.detalle || "").trim() || null;
    const etapasconversion_id = body.etapasconversion_id ? Number(body.etapasconversion_id) : null;
    const created_by = body.created_by ? Number(body.created_by) : null;
    const asignado_a = body.asignado_a ? Number(body.asignado_a) : null;

    // Validar campos obligatorios
    if (!cliente_id || !origen_id || !etapasconversion_id || !created_by) {
      return NextResponse.json(
        {
          message: "Campos obligatorios: cliente_id, origen_id, etapasconversion_id, created_by",
        },
        { status: 400 }
      );
    }

    // Validar existencia de registros relacionados
    const [clienteCheck] = await db.query(
      `SELECT id FROM clientes WHERE id = ? LIMIT 1`,
      [cliente_id]
    );
    if (!clienteCheck.length) {
      return NextResponse.json(
        { message: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    const [origenCheck] = await db.query(
      `SELECT id FROM origenes_citas WHERE id = ? LIMIT 1`,
      [origen_id]
    );
    if (!origenCheck.length) {
      return NextResponse.json(
        { message: "Origen no encontrado" },
        { status: 404 }
      );
    }

    if (suborigen_id) {
      const [suborigenCheck] = await db.query(
        `SELECT id FROM suborigenes_citas WHERE id = ? AND origen_id = ? LIMIT 1`,
        [suborigen_id, origen_id]
      );
      if (!suborigenCheck.length) {
        return NextResponse.json(
          { message: "Suborigen no válido para este origen" },
          { status: 404 }
        );
      }
    }

    const [etapaCheck] = await db.query(
      `SELECT id FROM etapasconversion WHERE id = ? LIMIT 1`,
      [etapasconversion_id]
    );
    if (!etapaCheck.length) {
      return NextResponse.json(
        { message: "Etapa no encontrada" },
        { status: 404 }
      );
    }

    const [usuarioCheck] = await db.query(
      `SELECT id FROM usuarios WHERE id = ? LIMIT 1`,
      [created_by]
    );
    if (!usuarioCheck.length) {
      return NextResponse.json(
        { message: "Usuario creador no encontrado" },
        { status: 404 }
      );
    }

    if (asignado_a) {
      const [asignadoCheck] = await db.query(
        `SELECT id FROM usuarios WHERE id = ? LIMIT 1`,
        [asignado_a]
      );
      if (!asignadoCheck.length) {
        return NextResponse.json(
          { message: "Usuario asignado no encontrado" },
          { status: 404 }
        );
      }
    }

    // Actualizar
    await db.query(
      `
      UPDATE oportunidades
      SET
        cliente_id = ?,
        marca_id = ?,
        modelo_id = ?,
        origen_id = ?,
        suborigen_id = ?,
        detalle = ?,
        etapasconversion_id = ?,
        created_by = ?,
        asignado_a = ?,
        updated_at = NOW()
      WHERE id = ? AND oportunidad_id LIKE 'LD-%'
      `,
      [
        cliente_id,
        marca_id,
        modelo_id,
        origen_id,
        suborigen_id,
        detalle,
        etapasconversion_id,
        created_by,
        asignado_a,
        id,
      ]
    );

    return NextResponse.json({
      message: "Lead actualizado correctamente",
      id,
    });
  } catch (error) {
    console.error("PUT /api/leads/[id] error:", error);
    return NextResponse.json(
      {
        message: "Error al actualizar lead",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE: eliminar lead
   - solo LD
========================= */
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    const [result] = await db.query(
      `DELETE FROM oportunidades WHERE id = ? AND oportunidad_id LIKE 'LD-%'`,
      [id]
    );

    if (!result.affectedRows) {
      return NextResponse.json(
        { message: "Lead LD no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Lead eliminado correctamente" });
  } catch (error) {
    console.error("DELETE /api/leads/[id] error:", error);
    return NextResponse.json(
      {
        message: "Error al eliminar lead",
        error: error.message,
      },
      { status: 500 }
    );
  }
}