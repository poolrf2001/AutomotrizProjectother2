import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/* =========================
   POST: Validar datos antes de importar
=========================*/
export async function POST(request) {
  try {
    const body = await request.json();
    const carros = body.carros || [];

    if (!Array.isArray(carros) || carros.length === 0) {
      return NextResponse.json(
        { message: "Debe proporcionar un array de carros" },
        { status: 400 }
      );
    }

    const validaciones = {
      validos: 0,
      invalidos: 0,
      detalles: [],
      advertencias: [],
    };

    for (let i = 0; i < carros.length; i++) {
      const carro = carros[i];
      const fila = i + 2;
      const errores = [];
      const advertencias = [];

      // ✅ Validar VIN
      const vin = (carro.vin || "").trim().toUpperCase();
      if (!vin) {
        errores.push("VIN es requerido");
      } else if (vin.length !== 17) {
        errores.push(`VIN debe tener 17 caracteres (tiene ${vin.length})`);
      }

      // ✅ Validar IDs
      const marcaId = parseInt(carro.marca_id);
      const modeloId = parseInt(carro.modelo_id);
      const versionId = parseInt(carro.version_id);

      if (!marcaId || isNaN(marcaId)) {
        errores.push("marca_id es requerido y debe ser un número");
      }
      if (!modeloId || isNaN(modeloId)) {
        errores.push("modelo_id es requerido y debe ser un número");
      }
      if (!versionId || isNaN(versionId)) {
        errores.push("version_id es requerido y debe ser un número");
      }

      // ✅ Validar precio
      if (carro.preciocompra) {
        const precio = parseFloat(carro.preciocompra);
        if (isNaN(precio)) {
          errores.push("preciocompra debe ser un número válido");
        } else if (precio < 0) {
          errores.push("preciocompra no puede ser negativo");
        }
      }

      // ✅ Validar fechas
      if (carro.created_at_facturacion) {
        if (isNaN(Date.parse(carro.created_at_facturacion))) {
          errores.push("created_at_facturacion formato de fecha inválido");
        }
      }

      if (carro.created_at_entrega) {
        if (isNaN(Date.parse(carro.created_at_entrega))) {
          errores.push("created_at_entrega formato de fecha inválido");
        }
      }

      // ✅ Validar que numerofactura no sea muy largo
      if (carro.numerofactura && carro.numerofactura.length > 100) {
        advertencias.push("numerofactura muy largo, se truncará a 100 caracteres");
      }

      if (errores.length === 0) {
        validaciones.validos++;
      } else {
        validaciones.invalidos++;
      }

      validaciones.detalles.push({
        fila,
        vin: vin || "N/A",
        errores,
        advertencias,
        estado: errores.length === 0 ? "válido" : "inválido",
      });
    }

    return NextResponse.json({
      validos: validaciones.validos,
      invalidos: validaciones.invalidos,
      total: carros.length,
      detalles: validaciones.detalles,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error al validar datos" },
      { status: 500 }
    );
  }
}