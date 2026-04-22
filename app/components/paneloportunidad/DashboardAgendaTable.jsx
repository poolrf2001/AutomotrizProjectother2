"use client";

import { useMemo } from "react";
import { Clock, Eye, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import PeriodFilterPopover from "./PeriodFilterPopover";

const BRAND_PRIMARY = "#5d16ec";

export default function DashboardAgendaTable({
  agendaHoy,
  agendaPaginada,
  totalPagAgenda,
  pagAgenda,
  setPagAgenda,
  filterAgendaPeriodo,
  setFilterAgendaPeriodo,
  FILTER_TODAY,
  FILTER_THIS_WEEK,
  FILTER_THIS_MONTH,
  router,
  rawData,
  canEdit,
}) {
  const options = useMemo(
    () => [
      { value: FILTER_TODAY, label: "Hoy" },
      { value: FILTER_THIS_WEEK, label: "Esta semana" },
      { value: FILTER_THIS_MONTH, label: "Este mes" },
    ],
    [FILTER_TODAY, FILTER_THIS_WEEK, FILTER_THIS_MONTH]
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} style={{ color: BRAND_PRIMARY }} />
            <CardTitle className="text-sm" style={{ color: BRAND_PRIMARY }}>
              Tareas del dia - {agendaHoy.length} registros
            </CardTitle>
          </div>

          <PeriodFilterPopover
            value={filterAgendaPeriodo}
            onChange={(value) => {
              setFilterAgendaPeriodo(value);
              setPagAgenda(0);
            }}
            options={options}
            label={
              filterAgendaPeriodo === FILTER_TODAY
                ? "Hoy"
                : filterAgendaPeriodo === FILTER_THIS_WEEK
                ? "Semana"
                : "Mes"
            }
          />
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        {agendaHoy.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-500">
            No hay items en agenda para este período
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs px-3 py-2">Tipo</TableHead>
                  <TableHead className="text-xs px-3 py-2">Código</TableHead>
                  <TableHead className="text-xs px-3 py-2">Cliente</TableHead>
                  <TableHead className="text-xs px-3 py-2">Asignado</TableHead>
                  <TableHead className="text-xs px-3 py-2">Fecha Agenda</TableHead>
                  <TableHead className="text-xs px-3 py-2">Hora Agenda</TableHead>
                  <TableHead className="text-xs text-right px-3 py-2">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agendaPaginada.map((item) => {
                  const usuario = rawData.usuarios.find((u) => u.id === item.asignado_a);
                  const cliente = rawData.usuarios.find((c) => c.id === item.cliente_id);
                  const fecha = new Date(item.detalle.fecha_agenda).toLocaleDateString();
                  const hora = item.detalle.hora_agenda?.substring(0, 5);

                  return (
                    <TableRow key={`${item.tipo}-${item.id}`} className="hover:bg-gray-50">
                      <TableCell className="text-xs px-3 py-2 font-bold">
                        <span
                          style={{
                            backgroundColor: item.tipo === "OPO" ? "#5d16ec" : "#ff6b6b",
                            color: "white",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                          }}
                        >
                          {item.tipo}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs px-3 py-2 font-medium">
                        {item.oportunidad_id || `${item.tipo}-${item.id}`}
                      </TableCell>
                      <TableCell className="text-xs px-3 py-2 max-w-xs truncate">
                        {cliente?.fullname || "-"}
                      </TableCell>
                      <TableCell className="text-xs px-3 py-2">
                        {usuario?.fullname || "Sin asignar"}
                      </TableCell>
                      <TableCell className="text-xs px-3 py-2">{fecha}</TableCell>
                      <TableCell className="text-xs px-3 py-2 font-semibold">
                        {hora}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => router.push(`/oportunidades/${item.id}`)}
                              >
                                <Eye size={12} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="text-xs">
                              Ver
                            </TooltipContent>
                          </Tooltip>

                          {canEdit && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => router.push(`/oportunidades/${item.id}`)}
                                >
                                  <Edit2 size={12} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="text-xs">
                                Editar
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {totalPagAgenda > 1 && (
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t text-xs">
                <span className="text-gray-600">
                  Página {pagAgenda + 1} de {totalPagAgenda}
                </span>
                <div className="flex gap-2" />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}