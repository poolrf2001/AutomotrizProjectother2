// app/api/precios/suma/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function parseCsvInts(str) {
  if (!str) return [];
  return String(str)
    .split(",")
    .map((x) => toInt(x.trim()))
    .filter((x) => x != null);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const mantenimiento_id = toInt(searchParams.get("mantenimiento_id"));
    const marca_id = toInt(searchParams.get("marca_id"));
    const modelo_id = toInt(searchParams.get("modelo_id"));

    // sub_ids: SOLO para el mantenimiento principal (ej: 17,18)
    const sub_ids = parseCsvInts(searchParams.get("sub_ids"));

    // nivel para mantenimiento 1 (nth): 1..10 (si viene 20 => se usa 10)
    let nivel = toInt(searchParams.get("nivel"));
    if (!nivel || nivel < 1) nivel = 1;
    if (nivel > 10) nivel = 10;

    if (!mantenimiento_id || !marca_id || !modelo_id) {
      return NextResponse.json(
        { message: "mantenimiento_id, marca_id y modelo_id son requeridos" },
        { status: 400 }
      );
    }

    // 1) Obtener dependencias desde mantenimiento.mantenimiento_id (texto "1,3,4")
    const [mRows] = await db.query(
      `SELECT id, mantenimiento_id
       FROM mantenimiento
       WHERE id = ?
       LIMIT 1`,
      [mantenimiento_id]
    );

    if (!mRows.length) {
      return NextResponse.json(
        { message: "Mantenimiento no encontrado" },
        { status: 404 }
      );
    }

    const deps = parseCsvInts(mRows[0].mantenimiento_id); // ej [3,1]
    // siempre incluir el mantenimiento principal
    const mantenimientoSet = new Set([mantenimiento_id, ...deps]);

    // 2) Armar lista de (mantenimiento_id, submantenimiento_id) a sumar
    const targets = [];
    const seenPairs = new Set();

    function addTarget(mid, sid) {
      const key = `${mid}-${sid}`;
      if (seenPairs.has(key)) return;
      seenPairs.add(key);
      targets.push({ mantenimiento_id: mid, submantenimiento_id: sid });
    }

    // A) Mantenimiento principal:
    // - si mandas sub_ids => solo esos
    // - si no mandas => suma todos los precios de ese mantenimiento (para esa marca/modelo)
    if (sub_ids.length) {
      for (const sid of sub_ids) addTarget(mantenimiento_id, sid);
    } else {
      const [rowsAllMain] = await db.query(
        `SELECT DISTINCT submantenimiento_id
         FROM precios
         WHERE mantenimiento_id = ? AND marca_id = ? AND modelo_id = ?
         ORDER BY submantenimiento_id ASC`,
        [mantenimiento_id, marca_id, modelo_id]
      );
      for (const r of rowsAllMain) addTarget(mantenimiento_id, Number(r.submantenimiento_id));
    }

    // B) Dependencias automáticas:
    for (const depId of mantenimientoSet) {
      if (depId === mantenimiento_id) continue;

      // Si depId == 1 => nth por "nivel"
      if (depId === 1) {
        const [nthRow] = await db.query(
          `SELECT id
           FROM submantenimiento
           WHERE type_id = ?
           ORDER BY id ASC
           LIMIT 1 OFFSET ?`,
          [1, nivel - 1]
        );
        if (nthRow.length) addTarget(1, Number(nthRow[0].id));
        continue;
      }

      // Otros deps => suma todos sus submantenimientos con precio (según precios)
      const [depSubs] = await db.query(
        `SELECT DISTINCT submantenimiento_id
         FROM precios
         WHERE mantenimiento_id = ? AND marca_id = ? AND modelo_id = ?
         ORDER BY submantenimiento_id ASC`,
        [depId, marca_id, modelo_id]
      );

      for (const r of depSubs) addTarget(depId, Number(r.submantenimiento_id));
    }

    // 3) Si no hay targets, total 0
    if (!targets.length) {
      return NextResponse.json({ total: 0 }, { status: 200 });
    }

    // 4) Consultar todos los precios de esos targets en una sola query (OR)
    const whereParts = [];
    const params = [marca_id, modelo_id];

    for (const t of targets) {
      whereParts.push("(p.mantenimiento_id = ? AND p.submantenimiento_id = ?)");
      params.push(t.mantenimiento_id, t.submantenimiento_id);
    }

    const [priceRows] = await db.query(
      `
        SELECT p.mantenimiento_id, p.submantenimiento_id, p.precio
        FROM precios p
        WHERE p.marca_id = ?
          AND p.modelo_id = ?
          AND (${whereParts.join(" OR ")})
      `,
      params
    );

    let total = 0;
    for (const r of priceRows) {
      const precio = Number(r.precio);
      if (Number.isFinite(precio)) total += precio;
    }

    return NextResponse.json({ total: Number(total.toFixed(2)) }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Error calculando suma de precios" },
      { status: 500 }
    );
  }
}