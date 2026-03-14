import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/cotizaciones?tipo=taller|pyp
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo");

    let query = `
      SELECT
        c.*,
        CONCAT(cl.nombre, ' ', IFNULL(cl.apellido,'')) AS cliente_nombre,
        u.fullname AS usuario_nombre,
        ct.nombre AS tarifa_nombre,
        ce.nombre AS centro_nombre,
        t.nombre AS taller_nombre,
        m.nombre AS mostrador_nombre,
        mo.codigo AS moneda_codigo,
        mo.simbolo AS moneda_simbolo,
        im.nombre AS impuesto_nombre,
        im.porcentaje AS impuesto_porcentaje_config
      FROM cotizaciones c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      LEFT JOIN usuarios u ON c.usuario_id = u.id
      LEFT JOIN cotizacion_tarifas ct ON c.tarifa_id = ct.id
      LEFT JOIN centros ce ON c.centro_id = ce.id
      LEFT JOIN talleres t ON c.taller_id = t.id
      LEFT JOIN mostradores m ON c.mostrador_id = m.id
      LEFT JOIN monedas mo ON c.moneda_id = mo.id
      LEFT JOIN impuestos im ON c.impuesto_id = im.id
    `;
    const params = [];

    if (tipo) {
      query += " WHERE c.tipo = ?";
      params.push(tipo);
    }

    query += " ORDER BY c.created_at DESC";

    try {
      const [rows] = await db.query(query, params);
      return NextResponse.json(rows);
    } catch (e) {
      if (e?.code !== "ER_BAD_FIELD_ERROR") throw e;
      let fallbackQuery = `
        SELECT
          c.*,
          CONCAT(cl.nombre, ' ', IFNULL(cl.apellido,'')) AS cliente_nombre,
          u.fullname AS usuario_nombre,
          ct.nombre AS tarifa_nombre,
          ce.nombre AS centro_nombre,
          t.nombre AS taller_nombre,
          m.nombre AS mostrador_nombre
        FROM cotizaciones c
        LEFT JOIN clientes cl ON c.cliente_id = cl.id
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        LEFT JOIN cotizacion_tarifas ct ON c.tarifa_id = ct.id
        LEFT JOIN centros ce ON c.centro_id = ce.id
        LEFT JOIN talleres t ON c.taller_id = t.id
        LEFT JOIN mostradores m ON c.mostrador_id = m.id
      `;
      const fallbackParams = [];
      if (tipo) {
        fallbackQuery += " WHERE c.tipo = ?";
        fallbackParams.push(tipo);
      }
      fallbackQuery += " ORDER BY c.created_at DESC";
      const [rows] = await db.query(fallbackQuery, fallbackParams);
      return NextResponse.json(rows);
    }
  } catch (error) {
    console.error("Error fetching cotizaciones:", error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST /api/cotizaciones
export async function POST(req) {
  const conn = await db.getConnection();
  try {
    const body = await req.json();
    const {
      tipo, cliente_id, usuario_id, descripcion,
      centro_id, taller_id, mostrador_id,
      horas_trabajo, tarifa_id, tarifa_hora,
      descuento_porcentaje, descuento_monto,
      moneda_id, impuesto_id, incluir_igv, impuesto_porcentaje,
      productos, extras
    } = body;

    if (!tipo || !usuario_id) {
      return NextResponse.json({ message: "Faltan campos requeridos (tipo, usuario)" }, { status: 400 });
    }

    await conn.beginTransaction();

    // Calculate subtotals
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

    // Insert main cotización
    let result;
    try {
      [result] = await conn.query(
        `INSERT INTO cotizaciones
          (tipo, cliente_id, usuario_id, descripcion,
           centro_id, taller_id, mostrador_id,
           subtotal_productos, subtotal_mano_obra, subtotal_extras,
           descuento_porcentaje, descuento_monto,
           monto_total, horas_trabajo, tarifa_id, tarifa_hora,
           moneda_id, impuesto_id, incluir_igv, impuesto_porcentaje,
           estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
        [
          tipo, cliente_id || null, usuario_id, descripcion || null,
          centro_id || null, taller_id || null, mostrador_id || null,
          subtotal_productos, subtotal_mano_obra, subtotal_extras,
          descPct, descMonto,
          monto_total, horas_trabajo || 0, tarifa_id || null, tarifa_hora || 0,
          moneda_id || null, impuesto_id || null, aplicaIgv ? 1 : 0, igvPct
        ]
      );
    } catch (e) {
      if (e?.code !== "ER_BAD_FIELD_ERROR") throw e;
      [result] = await conn.query(
        `INSERT INTO cotizaciones
          (tipo, cliente_id, usuario_id, descripcion,
           centro_id, taller_id, mostrador_id,
           subtotal_productos, subtotal_mano_obra, subtotal_extras,
           descuento_porcentaje, descuento_monto,
           monto_total, horas_trabajo, tarifa_id, tarifa_hora, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
        [
          tipo, cliente_id || null, usuario_id, descripcion || null,
          centro_id || null, taller_id || null, mostrador_id || null,
          subtotal_productos, subtotal_mano_obra, subtotal_extras,
          descPct, descMonto,
          monto_total, horas_trabajo || 0, tarifa_id || null, tarifa_hora || 0
        ]
      );
    }

    const cotizacionId = result.insertId;

    // Insert productos
    if (productos && productos.length > 0) {
      const prodValues = productos.map(p => [
        cotizacionId, p.producto_id, p.cantidad, p.precio_unitario, p.subtotal,
        Number(p.descuento_porcentaje || 0)
      ]);
      await conn.query(
        `INSERT INTO cotizacion_productos (cotizacion_id, producto_id, cantidad, precio_unitario, subtotal, descuento_porcentaje)
         VALUES ?`,
        [prodValues]
      );
    }

    // Insert adicionales
    if (extras && extras.length > 0) {
      const extValues = extras.map((e) => [
        cotizacionId,
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
          return [cotizacionId, x.descripcion, Math.max(0, base - descuento)];
        });
        await conn.query(
          `INSERT INTO cotizacion_extras (cotizacion_id, descripcion, monto) VALUES ?`,
          [extFallbackValues]
        );
      }
    }

    await conn.commit();
    return NextResponse.json({ message: "Cotización creada", id: cotizacionId });
  } catch (error) {
    await conn.rollback();
    console.error("Error creating cotización:", error);
    return NextResponse.json({ message: "Error al crear cotización" }, { status: 500 });
  } finally {
    conn.release();
  }
}
