"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Download,
  Loader2,
  Info,
  Eye,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Share2,
  Package,
  DollarSign,
  Truck,
  Zap,
  Image as ImageIcon,
  Play,
} from "lucide-react";
import { toast } from "sonner";

export default function CotizacionPublicaPage({ params: paramsPromise }) {
  const params = use(paramsPromise);

  const [cotizacion, setCotizacion] = useState(null);
  const [accesorios, setAccesorios] = useState([]);
  const [precioVersion, setPrecioVersion] = useState(null);
  const [especificaciones, setEspecificaciones] = useState([]);
  const [historial, setHistorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        console.log("=== Cargando cotización pública ===");
        console.log("Token:", params.token);

        // Cargar cotización
        const resCot = await fetch(
          `/api/public/cotizacion/${params.token}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        console.log("Response status:", resCot.status);

        if (!resCot.ok) {
          const error = await resCot.text();
          console.error("Error response:", error);
          toast.error("Cotización no encontrada");
          return;
        }

        const dataC = await resCot.json();

        console.log("Cotización cargada:", {
          id: dataC.id,
          marca: dataC.marca_nombre,
          modelo: dataC.modelo_nombre,
          version_id: dataC.version_id,
        });

        setCotizacion(dataC);

        // ✅ CARGAR ACCESORIOS
        if (dataC.id) {
          try {
            const resAcc = await fetch(
              `/api/cotizaciones-accesorios/by-cotizacion/${dataC.id}`,
              { cache: "no-store" }
            );

            if (resAcc.ok) {
              const dataAcc = await resAcc.json();
              const accesoriosFormateados = Array.isArray(dataAcc)
                ? dataAcc.map((acc) => ({
                    ...acc,
                    cantidad: Number(acc.cantidad),
                    precio_unitario: Number(acc.precio_unitario),
                    subtotal: Number(acc.subtotal),
                    descuento_porcentaje: acc.descuento_porcentaje
                      ? Number(acc.descuento_porcentaje)
                      : 0,
                    descuento_monto: acc.descuento_monto
                      ? Number(acc.descuento_monto)
                      : 0,
                    total: Number(acc.total),
                  }))
                : [];

              setAccesorios(accesoriosFormateados);
              console.log("Accesorios cargados:", accesoriosFormateados.length);
            }
          } catch (error) {
            console.error("Error cargando accesorios:", error);
          }
        }

        // ✅ CARGAR PRECIO DE VERSION
        if (dataC.marca_id && dataC.modelo_id && dataC.version_id) {
          try {
            const resPrecios = await fetch(
              `/api/precios-region-version?marca_id=${dataC.marca_id}&modelo_id=${dataC.modelo_id}&version_id=${dataC.version_id}`,
              { cache: "no-store" }
            );

            if (resPrecios.ok) {
              const dataPreciosArray = await resPrecios.json();
              if (Array.isArray(dataPreciosArray) && dataPreciosArray.length > 0) {
                const precioEncontrado = dataPreciosArray.find(
                  (p) =>
                    p.marca_id === dataC.marca_id &&
                    p.modelo_id === dataC.modelo_id &&
                    p.version_id === dataC.version_id
                );

                if (precioEncontrado) {
                  setPrecioVersion({
                    ...precioEncontrado,
                    precio_base: Number(precioEncontrado.precio_base),
                  });
                  console.log("Precio de versión cargado:", precioEncontrado);
                }
              }
            }
          } catch (error) {
            console.error("Error cargando precio:", error);
          }
        }

        // ✅ CARGAR ESPECIFICACIONES
        if (dataC.marca_id && dataC.modelo_id) {
          try {
            const resEspec = await fetch(
              `/api/modelo-especificaciones?marca_id=${dataC.marca_id}&modelo_id=${dataC.modelo_id}`,
              { cache: "no-store" }
            );

            if (resEspec.ok) {
              const dataEspec = await resEspec.json();
              setEspecificaciones(Array.isArray(dataEspec) ? dataEspec : []);
              console.log("Especificaciones cargadas:", dataEspec.length);
            }
          } catch (error) {
            console.error("Error cargando especificaciones:", error);
          }
        }

        // Cargar historial de vistas
        if (dataC.id) {
          console.log("Cargando historial para cotización ID:", dataC.id);

          const resHist = await fetch(
            `/api/cotizacionesagenda/${dataC.id}/vistas-historial`,
            {
              method: "GET",
              cache: "no-store",
            }
          );

          const dataH = await resHist.json();

          console.log("Historial cargado:", {
            vistas_totales: dataH.vistas_totales,
            historial_items: dataH.historial?.length || 0,
          });

          setHistorial(dataH);
        }
      } catch (error) {
        console.error("Error cargando cotización:", error);
        toast.error("Error cargando cotización: " + error.message);
      } finally {
        setLoading(false);
      }
    }

    if (params?.token) {
      loadData();
    }
  }, [params?.token]);

  async function generatePDF() {
    try {
      if (!cotizacion || !cotizacion.id) {
        toast.error("No se puede generar PDF sin ID de cotización");
        return;
      }

      setGeneratingPdf(true);

      const response = await fetch(
        `/api/cotizacionesagenda/${cotizacion.id}/pdf`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Error generando PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Cotizacion-Q-${String(cotizacion.id).padStart(6, "0")}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.success("PDF descargado");
    } catch (error) {
      console.error(error);
      toast.error("Error generando PDF");
    } finally {
      setGeneratingPdf(false);
    }
  }

  async function copiarEnlace() {
    const enlace = `${window.location.origin}/cotizacion-publica/${params.token}`;
    await navigator.clipboard.writeText(enlace);
    toast.success("Enlace copiado al portapapeles");
  }

  // ✅ FUNCIÓN PARA RENDERIZAR ESPECIFICACIONES POR TIPO
  const renderEspecificacion = (espec) => {
    switch (espec.tipo_dato) {
      case "media":
        if (espec.valor.includes("youtu")) {
          // Es un video de YouTube
          const videoId = espec.valor.split("v=")[1] || espec.valor.split("/").pop();
          return (
            <div className="space-y-2">
              <p className="text-xs text-gray-600 font-semibold uppercase">
                {espec.especificacion_nombre}
              </p>
              <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={espec.especificacion_nombre}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          );
        } else {
          // Es una imagen
          return (
            <div className="space-y-2">
              <p className="text-xs text-gray-600 font-semibold uppercase">
                {espec.especificacion_nombre}
              </p>
              <img
                src={espec.valor}
                alt={espec.especificacion_nombre}
                className="w-full h-auto rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              />
            </div>
          );
        }

      case "texto":
        if (espec.valor.includes("youtu")) {
          // Es un video de YouTube (URL de texto)
          const videoId = espec.valor.split("v=")[1] || espec.valor.split("/").pop();
          return (
            <div className="space-y-2">
              <p className="text-xs text-gray-600 font-semibold uppercase flex items-center gap-1">
                <Play className="h-4 w-4 text-red-500" />
                {espec.especificacion_nombre}
              </p>
              <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={espec.especificacion_nombre}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          );
        } else if (espec.valor.includes("http")) {
          // Es una URL de imagen (texto)
          return (
            <div className="space-y-2">
              <p className="text-xs text-gray-600 font-semibold uppercase flex items-center gap-1">
                <ImageIcon className="h-4 w-4 text-blue-500" />
                {espec.especificacion_nombre}
              </p>
              <img
                src={espec.valor}
                alt={espec.especificacion_nombre}
                className="w-full h-auto rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              />
            </div>
          );
        } else {
          // Es texto plano
          return (
            <div className="space-y-2">
              <p className="text-xs text-gray-600 font-semibold uppercase flex items-center gap-1">
                <Zap className="h-4 w-4 text-yellow-500" />
                {espec.especificacion_nombre}
              </p>
              <p className="text-lg font-bold text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200">
                {espec.valor}
              </p>
            </div>
          );
        }

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Cargando cotización...</p>
        </div>
      </div>
    );
  }

  if (!cotizacion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <Card className="w-full max-w-md border-red-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertCircle className="h-12 w-12 text-red-600" />
              <h2 className="text-xl font-bold text-red-900">
                Cotización no encontrada
              </h2>
              <p className="text-sm text-red-700">
                El enlace puede haber expirado o no ser válido
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ CALCULAR TOTALES POR MONEDA DE ACCESORIOS
  const agruparAccesoriosPorMoneda = () => {
    const grupos = {};

    accesorios.forEach((acc) => {
      const monedaCodigo = acc.moneda_codigo || "SIN_MONEDA";

      if (!grupos[monedaCodigo]) {
        grupos[monedaCodigo] = {
          simbolo: acc.moneda_simbolo,
          codigo: monedaCodigo,
          subtotal: 0,
          descuento: 0,
          total: 0,
          accesorios: [],
        };
      }

      grupos[monedaCodigo].subtotal += acc.subtotal || 0;
      grupos[monedaCodigo].descuento += acc.descuento_monto || 0;
      grupos[monedaCodigo].total += acc.total || 0;
      grupos[monedaCodigo].accesorios.push(acc);
    });

    return Object.values(grupos);
  };

  const gruposAccesoriosPorMoneda = agruparAccesoriosPorMoneda();

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-900 rounded-full mb-4">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Cotización pública compartida
              </span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Cotización Q-{String(cotizacion.id).padStart(6, "0")}
            </h1>
            <p className="text-gray-600">
              Detalle completo de tu cotización
            </p>
          </div>

          {/* INFORMACIÓN PRINCIPAL */}
          <Card className="border-l-4 border-l-blue-500 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
              <CardTitle className="text-lg font-bold text-gray-900">
                Información del Vehículo
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      MARCA
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {cotizacion.marca_nombre || "No especificado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      MODELO
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {cotizacion.modelo_nombre || "No especificado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      AÑO
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {cotizacion.anio || "No especificado"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      COLOR EXTERNO
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{
                          backgroundColor:
                            {
                              Rojo: "#EF4444",
                              Negro: "#1F2937",
                              Blanco: "#F3F4F6",
                              Plateado: "#D1D5DB",
                              Azul: "#3B82F6",
                              Gris: "#9CA3AF",
                            }[cotizacion.color_externo] || "#E5E7EB",
                        }}
                      />
                      <p className="font-semibold text-gray-900">
                        {cotizacion.color_externo || "No especificado"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      COLOR INTERNO
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {cotizacion.color_interno || "No especificado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      SKU
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {cotizacion.sku || "No especificado"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ✅ ESPECIFICACIONES DEL MODELO */}
          {especificaciones.length > 0 && (
            <Card className="border-l-4 border-l-orange-500 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Especificaciones del Modelo
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {especificaciones.map((espec) => (
                    <div key={espec.id}>
                      {renderEspecificacion(espec)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ✅ INFORMACIÓN DE PRECIO DE VERSIÓN */}
          {precioVersion && (
            <Card className="border-l-4 border-l-green-500 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Información de Precio
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-600 font-semibold mb-2 uppercase">
                      Versión
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {precioVersion.version}
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 font-semibold mb-2 uppercase">
                      Precio Base
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${Number(precioVersion.precio_base).toLocaleString("es-ES")}
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs text-purple-600 font-semibold mb-2 uppercase">
                      Stock
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          precioVersion.en_stock
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {precioVersion.en_stock ? "En Stock" : "Sin Stock"}
                      </Badge>
                      {precioVersion.tiempo_entrega_dias > 0 && (
                        <div className="flex items-center gap-1 text-xs text-purple-600">
                          <Truck className="h-4 w-4" />
                          {precioVersion.tiempo_entrega_dias} días
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ✅ ACCESORIOS */}
          {accesorios.length > 0 && (
            <Card className="border-l-4 border-l-purple-500 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  Accesorios ({accesorios.length})
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {gruposAccesoriosPorMoneda.map((grupo) => (
                  <div key={grupo.codigo} className="space-y-3">
                    {/* Encabezado de Moneda */}
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <h3 className="font-semibold text-purple-900">
                        Accesorios en {grupo.simbolo} ({grupo.codigo})
                      </h3>
                    </div>

                    {/* Tabla de Accesorios */}
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100 border-b">
                            <th className="text-left p-3 font-semibold">
                              Descripción
                            </th>
                            <th className="text-left p-3 font-semibold">
                              N° Parte
                            </th>
                            <th className="text-right p-3 font-semibold">
                              Cantidad
                            </th>
                            <th className="text-right p-3 font-semibold">
                              Unitario
                            </th>
                            <th className="text-right p-3 font-semibold">
                              Subtotal
                            </th>
                            <th className="text-right p-3 font-semibold">
                              Descuento
                            </th>
                            <th className="text-right p-3 font-semibold">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {grupo.accesorios.map((acc) => (
                            <tr key={acc.id} className="border-b hover:bg-gray-50">
                              <td className="p-3">{acc.detalle}</td>
                              <td className="p-3 text-gray-600">
                                {acc.numero_parte}
                              </td>
                              <td className="text-right p-3">
                                {acc.cantidad}
                              </td>
                              <td className="text-right p-3">
                                {Number(acc.precio_unitario).toFixed(2)}{" "}
                                {acc.moneda_simbolo}
                              </td>
                              <td className="text-right p-3 font-medium">
                                {Number(acc.subtotal).toFixed(2)}
                              </td>
                              <td className="text-right p-3">
                                {acc.descuento_monto &&
                                Number(acc.descuento_monto) > 0 ? (
                                  <>
                                    <p className="text-xs text-gray-500">
                                      {acc.descuento_porcentaje}%
                                    </p>
                                    <p className="font-medium">
                                      -{Number(acc.descuento_monto).toFixed(2)}
                                    </p>
                                  </>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="text-right p-3 font-bold text-purple-600">
                                {Number(acc.total).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totales por Moneda */}
                    <div className="space-y-2 p-4 bg-purple-50 rounded-lg ml-auto w-96 border-l-4 border-purple-500">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">
                          {Number(grupo.subtotal).toFixed(2)} {grupo.simbolo}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Descuentos:</span>
                        <span className="font-medium text-red-600">
                          -{Number(grupo.descuento).toFixed(2)} {grupo.simbolo}
                        </span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-bold text-gray-900">Total:</span>
                        <span className="font-bold text-lg text-purple-600">
                          {Number(grupo.total).toFixed(2)} {grupo.simbolo}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* BOTONES DE ACCIÓN */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={copiarEnlace}
                  variant="outline"
                  className="gap-2"
                >
                  <Share2 className="h-5 w-5" />
                  Copiar Enlace
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Copia el enlace para compartir
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={generatePDF}
                  disabled={generatingPdf}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg gap-2"
                >
                  {generatingPdf ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generando PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Descargar PDF Completo
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Descarga la cotización en formato PDF
              </TooltipContent>
            </Tooltip>
          </div>

          {/* INFO */}
          <Card className="bg-blue-50 border border-blue-200">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-semibold mb-2">Información:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Este enlace es público y puede ser compartido</li>
                    <li>Cada apertura es registrada automáticamente</li>
                    <li>
                      Se muestra la IP, dispositivo y hora de cada visualización
                    </li>
                    <li>
                      Puedes descargar el PDF en cualquier momento sin
                      restricciones
                    </li>
                    <li>
                      Los precios mostrados incluyen el vehículo base más los
                      accesorios
                    </li>
                    <li>
                      Las especificaciones incluyen imágenes, videos y datos técnicos
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}