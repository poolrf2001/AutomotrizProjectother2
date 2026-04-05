import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/* =========================
   POST: Importar carros en masa (CSV o JSON)
=========================*/
export async function POST(request) {
  let connection;

  try {
    const body = await request.json();

    const carros = body.carros || [];
    const formato = body.formato || "json"; // json o csv

    /* =========================
       VALIDACIONES
    =========================*/
    if (!Array.isArray(carros) || carros.length === 0) {
      return NextResponse.json(
        { message: "Debe proporcionar un array de carros" },
        { status: 400 }
      );
    }

    if (carros.length > 1000) {
      return NextResponse.json(
        { message: "Máximo 1000 registros por importación" },
        { status: 400 }
      );
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const resultados = {
      importados: 0,
      errores: 0,
      detalles: [],
      vinsDuplicados: [],
      vinsProcesados: [],
    };

    // ✅ Procesar cada carro
    for (let i = 0; i < carros.length; i++) {
      const carro = carros[i];
      const fila = i + 2; // +2 porque Excel comienza en 1 y encabezado en 1

      try {
        // ✅ Validar campos requeridos
        const vin = (carro.vin || "").trim().toUpperCase();
        const marcaId = parseInt(carro.marca_id);
        const modeloId = parseInt(carro.modelo_id);
        const versionId = parseInt(carro.version_id);

        if (!vin || vin.length !== 17) {
          resultados.errores++;
          resultados.detalles.push({
            fila,
            vin: vin || "N/A",
            error: "VIN inválido. Debe tener 17 caracteres",
            estado: "error",
          });
          continue;
        }

        if (!marcaId || !modeloId || !versionId) {
          resultados.errores++;
          resultados.detalles.push({
            fila,
            vin,
            error: "marca_id, modelo_id y version_id son requeridos",
            estado: "error",
          });
          continue;
        }

        // ✅ Validar tipos numéricos
        if (isNaN(marcaId) || isNaN(modeloId) || isNaN(versionId)) {
          resultados.errores++;
          resultados.detalles.push({
            fila,
            vin,
            error: "marca_id, modelo_id y version_id deben ser números",
            estado: "error",
          });
          continue;
        }

        const numerofactura = carro.numerofactura ? (carro.numerofactura || "").trim() : null;
        const preciocompra = carro.preciocompra ? parseFloat(carro.preciocompra) : null;
        const createdAtFacturacion = carro.created_at_facturacion || null;
        const createdAtEntrega = carro.created_at_entrega || null;

        // ✅ Validar precio
        if (preciocompra !== null && (isNaN(preciocompra) || preciocompra < 0)) {
          resultados.errores++;
          resultados.detalles.push({
            fila,
            vin,
            error: "Precio de compra inválido. Debe ser un número positivo",
            estado: "error",
          });
          continue;
        }

        // ✅ Verificar si el VIN ya existe
        const [existing] = await connection.query(
          `SELECT vin FROM historial_carros WHERE vin = ?`,
          [vin]
        );

        if (existing.length > 0) {
          resultados.errores++;
          resultados.vinsDuplicados.push(vin);
          resultados.detalles.push({
            fila,
            vin,
            error: "VIN ya existe en la base de datos",
            estado: "duplicado",
          });
          continue;
        }

        // ✅ Verificar referencias
        const [marcaExists] = await connection.query(
          `SELECT id FROM marcas WHERE id = ?`,
          [marcaId]
        );

        if (marcaExists.length === 0) {
          resultados.errores++;
          resultados.detalles.push({
            fila,
            vin,
            error: `Marca con ID ${marcaId} no existe`,
            estado: "error",
          });
          continue;
        }

        const [modeloExists] = await connection.query(
          `SELECT id FROM modelos WHERE id = ?`,
          [modeloId]
        );

        if (modeloExists.length === 0) {
          resultados.errores++;
          resultados.detalles.push({
            fila,
            vin,
            error: `Modelo con ID ${modeloId} no existe`,
            estado: "error",
          });
          continue;
        }

        const [versionExists] = await connection.query(
          `SELECT id FROM versiones WHERE id = ?`,
          [versionId]
        );

        if (versionExists.length === 0) {
          resultados.errores++;
          resultados.detalles.push({
            fila,
            vin,
            error: `Versión con ID ${versionId} no existe`,
            estado: "error",
          });
          continue;
        }

        // ✅ Verificar combinación única
        const [duplicateCombo] = await connection.query(
          `
          SELECT vin FROM historial_carros 
          WHERE marca_id = ? AND modelo_id = ? AND version_id = ?
          `,
          [marcaId, modeloId, versionId]
        );

        if (duplicateCombo.length > 0) {
          resultados.errores++;
          resultados.detalles.push({
            fila,
            vin,
            error: "Ya existe un carro con esta combinación de marca, modelo y versión",
            estado: "error",
          });
          continue;
        }

        // ✅ INSERT
        await connection.query(
          `
          INSERT INTO historial_carros(
            vin, marca_id, modelo_id, version_id, 
            numerofactura, preciocompra, 
            created_at_facturacion, created_at_entrega
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            vin,
            marcaId,
            modeloId,
            versionId,
            numerofactura,
            preciocompra,
            createdAtFacturacion,
            createdAtEntrega,
          ]
        );

        resultados.importados++;
        resultados.vinsProcesados.push(vin);
        resultados.detalles.push({
          fila,
          vin,
          error: null,
          estado: "importado",
        });
      } catch (error) {
        console.error(`Error en fila ${fila}:`, error);
        resultados.errores++;
        resultados.detalles.push({
          fila,
          vin: carro.vin || "N/A",
          error: error.message,
          estado: "error",
        });
      }
    }

    await connection.commit();

    return NextResponse.json(
      {
        message: `✓ Importación completada. ${resultados.importados} registros importados, ${resultados.errores} errores`,
        resultados,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    if (connection) {
      await connection.rollback();
    }

    return NextResponse.json(
      { message: "Error al importar carros", error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}