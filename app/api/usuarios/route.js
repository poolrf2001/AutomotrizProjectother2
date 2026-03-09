import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

function normalizarIds(arr) {
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr.map(Number).filter((id) => Number.isInteger(id) && id > 0))];
}

/* =========================
   GET: listar usuarios
=========================*/
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        u.id,
        u.fullname,
        u.username,
        u.email,
        u.phone,
        u.role,
        u.is_active,
        u.permissions,
        u.work_schedule,
        u.created_at,
        u.color,

        (
          SELECT GROUP_CONCAT(DISTINCT um.mostrador_id ORDER BY um.mostrador_id ASC)
          FROM usuario_mostradores um
          WHERE um.usuario_id = u.id
        ) AS mostradores,

        (
          SELECT GROUP_CONCAT(DISTINCT uc.centro_id ORDER BY uc.centro_id ASC)
          FROM usuario_centros uc
          WHERE uc.usuario_id = u.id
        ) AS centros,

        (
          SELECT GROUP_CONCAT(DISTINCT ut.taller_id ORDER BY ut.taller_id ASC)
          FROM usuario_talleres ut
          WHERE ut.usuario_id = u.id
        ) AS talleres

      FROM usuarios u
      ORDER BY u.id DESC
    `);

    const data = rows.map((row) => ({
      ...row,
      mostradores: row.mostradores
        ? row.mostradores.split(",").map(Number)
        : [],
      centros: row.centros
        ? row.centros.split(",").map(Number)
        : [],
      talleres: row.talleres
        ? row.talleres.split(",").map(Number)
        : [],
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error al listar" }, { status: 500 });
  }
}

/* =========================
   POST: crear usuario
=========================*/
export async function POST(req) {
  let connection;

  try {
    const body = await req.json();

    const fullname = (body.fullname || "").trim();
    const username = (body.username || "").trim();
    const email = (body.email || "").trim();
    const phone = (body.phone || "").trim();
    const role = body.role || "user";
    const color = body.color ?? null;
    const is_active = body.is_active ?? 1;
    const password = body.password || "";

    const mostradores = normalizarIds(body.mostradores);
    const centros = normalizarIds(body.centros);
    const talleres = normalizarIds(body.talleres);

    const permissions =
      body.permissions == null
        ? null
        : typeof body.permissions === "string"
        ? body.permissions
        : JSON.stringify(body.permissions);

    const work_schedule =
      body.work_schedule == null
        ? null
        : typeof body.work_schedule === "string"
        ? body.work_schedule
        : JSON.stringify(body.work_schedule);

    /* =========================
       VALIDACIONES
    ==========================*/
    if (!fullname || !username || !password) {
      return NextResponse.json(
        { message: "Nombre, usuario y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "La contraseña debe tener mínimo 6 caracteres" },
        { status: 400 }
      );
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [dup] = await connection.query(
      `SELECT id FROM usuarios WHERE username = ? OR (email IS NOT NULL AND email = ?) LIMIT 1`,
      [username, email || null]
    );

    if (dup.length > 0) {
      await connection.rollback();
      return NextResponse.json(
        { message: "Usuario o email ya existen" },
        { status: 409 }
      );
    }

    /* =========================
       HASH PASSWORD
    ==========================*/
    const hashedPassword = await bcrypt.hash(password, 10);

    /* =========================
       INSERT USUARIO
    ==========================*/
    const [result] = await connection.query(
      `
      INSERT INTO usuarios
      (fullname, username, email, phone, role, password_hash, is_active, permissions, work_schedule, color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        fullname,
        username,
        email || null,
        phone || null,
        role,
        hashedPassword,
        is_active ? 1 : 0,
        permissions,
        work_schedule,
        color,
      ]
    );

    const usuarioId = result.insertId;

    /* =========================
       INSERT RELACIONES
    ==========================*/
    for (const mostrador_id of mostradores) {
      await connection.query(
        `
        INSERT INTO usuario_mostradores (usuario_id, mostrador_id)
        VALUES (?, ?)
        `,
        [usuarioId, mostrador_id]
      );
    }

    for (const centro_id of centros) {
      await connection.query(
        `
        INSERT INTO usuario_centros (usuario_id, centro_id)
        VALUES (?, ?)
        `,
        [usuarioId, centro_id]
      );
    }

    for (const taller_id of talleres) {
      await connection.query(
        `
        INSERT INTO usuario_talleres (usuario_id, taller_id)
        VALUES (?, ?)
        `,
        [usuarioId, taller_id]
      );
    }

    await connection.commit();

    return NextResponse.json(
      {
        message: "Usuario creado",
        id: usuarioId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    if (connection) {
      await connection.rollback();
    }

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return NextResponse.json(
        { message: "Uno de los mostradores, centros o talleres no existe" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Error al crear usuario" },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}