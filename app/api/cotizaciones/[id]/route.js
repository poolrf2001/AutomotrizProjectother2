import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/cotizaciones/:id  — detail with products and extras
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    let rows;
    try {
      [rows] = await db.query(
        `SELECT c.*,
                CONCAT(cl.nombre, ' ', IFNULL(cl.apellido,'')) AS cliente_nombre,
                cl.email AS cliente_email,
                cl.celular AS cliente_celular,
                u.fullname AS usuario_nombre,
                ct.nombre AS tarifa_nombre,
                ce.nombre AS centro_nombre,
                t.nombre AS taller_nombre,
                mo.nombre AS mostrador_nombre,
                mon.codigo AS moneda_codigo,
                mon.simbolo AS moneda_simbolo,
                im.nombre AS impuesto_nombre,
                im.porcentaje AS impuesto_porcentaje_config
         FROM cotizaciones c
         LEFT JOIN clientes cl ON c.cliente_id = cl.id
         LEFT JOIN usuarios u ON c.usuario_id = u.id
         LEFT JOIN cotizacion_tarifas ct ON c.tarifa_id = ct.id
         LEFT JOIN centros ce ON c.centro_id = ce.id
         LEFT JOIN talleres t ON c.taller_id = t.id
         LEFT JOIN mostradores mo ON c.mostrador_id = mo.id
         LEFT JOIN monedas mon ON c.moneda_id = mon.id
         LEFT JOIN impuestos im ON c.impuesto_id = im.id
         WHERE c.id = ?`,
        [id]
      );
    } catch (e) {
      if (e?.code !== "ER_BAD_FIELD_ERROR") throw e;
      [rows] = await db.query(
        `SELECT c.*,
                CONCAT(cl.nombre, ' ', IFNULL(cl.apellido,'')) AS cliente_nombre,
                cl.email AS cliente_email,
                cl.celular AS cliente_celular,
                u.fullname AS usuario_nombre,
                ct.nombre AS tarifa_nombre,
                ce.nombre AS centro_nombre,
                t.nombre AS taller_nombre,
                mo.nombre AS mostrador_nombre
         FROM cotizaciones c
         LEFT JOIN clientes cl ON c.cliente_id = cl.id
         LEFT JOIN usuarios u ON c.usuario_id = u.id
         LEFT JOIN cotizacion_tarifas ct ON c.tarifa_id = ct.id
         LEFT JOIN centros ce ON c.centro_id = ce.id
         LEFT JOIN talleres t ON c.taller_id = t.id
         LEFT JOIN mostradores mo ON c.mostrador_id = mo.id
         WHERE c.id = ?`,
        [id]
      );
    }

    if (!rows.length) {
      return NextResponse.json({ message: "No encontrada" }, { status: 404 });
    }

    const cotizacion = rows[0];

    // Load products
    const [productos] = await db.query(
      `SELECT cp.*, p.numero_parte, p.descripcion AS producto_nombre
       FROM cotizacion_productos cp
       LEFT JOIN productos p ON cp.producto_id = p.id
       WHERE cp.cotizacion_id = ?`,
      [id]
    );

    // Load extras
    const [extras] = await db.query(
      "SELECT * FROM cotizacion_extras WHERE cotizacion_id = ?",
      [id]
    );

    return NextResponse.json({ ...cotizacion, productos, extras });
  } catch (error) {
    console.error("Error fetching cotización:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// PUT /api/cotizaciones/:id  — update status or full edit
export async function PUT(req, { params }) {
  const conn = await db.getConnection();
  try {
    const { id } = await params;
    const body = await req.json();

    // If only updating estado
    if (body.estado && Object.keys(body).length === 1) {
      await conn.query("UPDATE cotizaciones SET estado = ? WHERE id = ?", [body.estado, id]);
      return NextResponse.json({ message: "Estado actualizado" });
    }

    const {
      tipo, cliente_id, usuario_id, descripcion,
      centro_id, taller_id, mostrador_id,
      horas_trabajo, tarifa_id, tarifa_hora,
      descuento_porcentaje, descuento_monto,
      moneda_id, impuesto_id, incluir_igv, impuesto_porcentaje,
      productos, extras
    } = body;

    await conn.beginTransaction();

    const subtotal_productos = (productos || []).reduce((sum, p) => {
      const base = Number(p.subtotal || 0);
      const desc = Number(p.descuento_porcentaje || 0);
      return sum + (base - base * desc / 100);
    }, 0);
    const subtotal_mano_obra = Number(horas_trabajo || 0) * Number(tarifa_hora || 0);
    const subtotal_extras = (extras || []).reduce((sum, e) => {
      if (e.monto_neto !== undefined && e.monto_neto !== null) {
        return sum + Number(e.monto_neto || 0);
      }
      const base = Number(e.monto || 0);
      const tipoDesc = e.descuento_tipo === "monto" ? "monto" : "porcentaje";
      const valor = Number(e.descuento_valor || 0);
      const descuento = tipoDesc === "monto"
        ? Math.max(0, Math.min(base, valor))
        : base * Math.max(0, Math.min(100, valor)) / 100;
      return sum + Math.max(0, base - descuento);
    }, 0);
    const bruto = subtotal_productos + subtotal_mano_obra + subtotal_extras;
    const descPct = Number(descuento_porcentaje || 0);
    const descMonto = Number(descuento_monto || 0);
    const neto = Math.max(0, bruto - (bruto * descPct / 100) - descMonto);
    const aplicaIgv = Number(incluir_igv || 0) === 1;
    const igvPct = Number(impuesto_porcentaje || 0);
    const igvMonto = aplicaIgv ? neto * igvPct / 100 : 0;
    const monto_total = neto + igvMonto;

    try {
      await conn.query(
        `UPDATE cotizaciones SET
          tipo=?, cliente_id=?, usuario_id=?, descripcion=?,
          centro_id=?, taller_id=?, mostrador_id=?,
          subtotal_productos=?, subtotal_mano_obra=?, subtotal_extras=?,
          descuento_porcentaje=?, descuento_monto=?,
          monto_total=?, horas_trabajo=?, tarifa_id=?, tarifa_hora=?,
          moneda_id=?, impuesto_id=?, incluir_igv=?, impuesto_porcentaje=?
         WHERE id=?`,
        [
          tipo, cliente_id || null, usuario_id, descripcion || null,
          centro_id || null, taller_id || null, mostrador_id || null,
          subtotal_productos, subtotal_mano_obra, subtotal_extras,
          descPct, descMonto,
          monto_total, horas_trabajo || 0, tarifa_id || null, tarifa_hora || 0,
          moneda_id || null, impuesto_id || null, aplicaIgv ? 1 : 0, igvPct,
          id
        ]
      );
    } catch (e) {
      if (e?.code !== "ER_BAD_FIELD_ERROR") throw e;
      await conn.query(
        `UPDATE cotizaciones SET
          tipo=?, cliente_id=?, usuario_id=?, descripcion=?,
          centro_id=?, taller_id=?, mostrador_id=?,
          subtotal_productos=?, subtotal_mano_obra=?, subtotal_extras=?,
          descuento_porcentaje=?, descuento_monto=?,
          monto_total=?, horas_trabajo=?, tarifa_id=?, tarifa_hora=?
         WHERE id=?`,
        [
          tipo, cliente_id || null, usuario_id, descripcion || null,
          centro_id || null, taller_id || null, mostrador_id || null,
          subtotal_productos, subtotal_mano_obra, subtotal_extras,
          descPct, descMonto,
          monto_total, horas_trabajo || 0, tarifa_id || null, tarifa_hora || 0,
          id
        ]
      );
    }

    // Replace products
    await conn.query("DELETE FROM cotizacion_productos WHERE cotizacion_id = ?", [id]);
    if (productos && productos.length > 0) {
      const prodValues = productos.map(p => [
        id, p.producto_id, p.cantidad, p.precio_unitario, p.subtotal,
        Number(p.descuento_porcentaje || 0)
      ]);
      await conn.query(
        `INSERT INTO cotizacion_productos (cotizacion_id, producto_id, cantidad, precio_unitario, subtotal, descuento_porcentaje)
         VALUES ?`,
        [prodValues]
      );
    }

    // Replace adicionales
    await conn.query("DELETE FROM cotizacion_extras WHERE cotizacion_id = ?", [id]);
    if (extras && extras.length > 0) {
      const extValues = extras.map((e) => [
        id,
        e.descripcion,
        Number(e.monto || 0),
        e.descuento_tipo === "monto" ? "monto" : "porcentaje",
        Number(e.descuento_valor || 0),
      ]);
      try {
        await conn.query(
          `INSERT INTO cotizacion_extras (cotizacion_id, descripcion, monto, descuento_tipo, descuento_valor) VALUES ?`,
          [extValues]
        );
      } catch (e) {
        if (e?.code !== "ER_BAD_FIELD_ERROR") throw e;
        const extFallbackValues = extras.map((x) => {
          const base = Number(x.monto || 0);
          const tipoDesc = x.descuento_tipo === "monto" ? "monto" : "porcentaje";
          const valor = Number(x.descuento_valor || 0);
          const descuento = tipoDesc === "monto"
            ? Math.max(0, Math.min(base, valor))
            : base * Math.max(0, Math.min(100, valor)) / 100;
          return [id, x.descripcion, Math.max(0, base - descuento)];
        });
        await conn.query(
          `INSERT INTO cotizacion_extras (cotizacion_id, descripcion, monto) VALUES ?`,
          [extFallbackValues]
        );
      }
    }

    await conn.commit();
    return NextResponse.json({ message: "Cotización actualizada" });
  } catch (error) {
    await conn.rollback();
    console.error("Error updating cotización:", error);
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  } finally {
    conn.release();
  }
}

// DELETE /api/cotizaciones/:id
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await db.query("DELETE FROM cotizaciones WHERE id = ?", [id]);
    return NextResponse.json({ message: "Cotización eliminada" });
  } catch (error) {
    console.error("Error deleting cotización:", error);
    return NextResponse.json({ message: "Error al eliminar" }, { status: 500 });
  }
}
