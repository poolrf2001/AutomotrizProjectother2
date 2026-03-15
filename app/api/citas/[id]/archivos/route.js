import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function GET(req, context) {
  const { id } = await context.params;

  const [rows] = await db.query(
    "SELECT * FROM cita_archivos WHERE cita_id=?",
    [id]
  );

  return Response.json(rows);
}

export const runtime = "nodejs";

export async function POST(req, context) {
  try {
    const { id } = await context.params;
    const citaId = Number(id);

    const formData = await req.formData();
    const file = formData.get("file");
    const userId = Number(formData.get("user_id"));

    console.log("ARCHIVOS PARAM ID:", id);
    console.log("ARCHIVOS FILE:", file);
    console.log("ARCHIVOS USER ID:", userId);

    const missing = [];
    if (!citaId) missing.push("cita_id");
    if (!file) missing.push("file");
    if (!userId) missing.push("user_id");

    if (missing.length > 0) {
      return NextResponse.json(
        {
          message: "Datos incompletos",
          missing,
          received: {
            cita_id: citaId || null,
            has_file: !!file,
            user_id: userId || null,
          },
        },
        { status: 400 }
      );
    }

    if (typeof file === "string") {
      return NextResponse.json(
        { message: "Archivo inválido" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = file.name.replace(/\s+/g, "_");
    const uniqueName = `${Date.now()}_${randomUUID()}_${safeName}`;

    const dirPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "citas",
      String(citaId)
    );

    await mkdir(dirPath, { recursive: true });

    const fullPath = path.join(dirPath, uniqueName);
    await writeFile(fullPath, buffer);

    const relativePath = `/uploads/citas/${citaId}/${uniqueName}`;

    await db.query(
      `
      INSERT INTO cita_archivos (
        cita_id,
        file_name,
        file_path,
        mime_type,
        size_kb,
        uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        citaId,
        file.name,
        relativePath,
        file.type || null,
        Math.ceil(file.size / 1024),
        userId,
      ]
    );

    return NextResponse.json({
      message: "Archivo subido correctamente",
      file_name: file.name,
      file_path: relativePath,
    });
  } catch (error) {
    console.error("ERROR API ARCHIVOS:", error);
    return NextResponse.json(
      {
        message: "Error subiendo archivo",
        error: error.message,
      },
      { status: 500 }
    );
  }
}