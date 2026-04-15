"use client";

import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BRAND_PRIMARY = "#5d16ec";

export default function AgendaHeader({
  days,
  monthStart,
  vistaFiltro,
  setVistaFiltro,
  weekStart,
  setWeekStart,
  setMonthStart,
  startOfWeek,
  startOfMonth,
  subWeeks,
  addWeeks,
  subMonths,
  addMonths,
  format,
  es,
  scopeLoading,
  centros,
  centroId,
  setCentroId,
  permCreate,
  onNew,
}) {
  return (
    <div className="flex flex-col md:flex-row gap-2 items-start md:items-center pb-3 border-b flex-shrink-0">
      <div className="flex items-center gap-2 flex-1">
        <div className="p-3 bg-[#5d16ec] rounded-lg shadow-md">
          <CalendarIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Agenda</h1>
          <p className="text-xs text-muted-foreground">
            {vistaFiltro === "semana"
              ? `${format(days[0], "dd MMM", { locale: es })} - ${format(days[6], "dd MMM", { locale: es })}`
              : format(monthStart, "MMMM yyyy", { locale: es })}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 items-center">
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (vistaFiltro === "semana") {
                    setWeekStart(subWeeks(weekStart, 1));
                  } else {
                    setMonthStart(subMonths(monthStart, 1));
                  }
                }}
              >
                <ChevronLeft size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Anterior</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (vistaFiltro === "semana") {
                    setWeekStart(addWeeks(weekStart, 1));
                  } else {
                    setMonthStart(addMonths(monthStart, 1));
                  }
                }}
              >
                <ChevronRight size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Siguiente</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
                  setMonthStart(startOfMonth(new Date()));
                }}
              >
                Hoy
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Volver a hoy</TooltipContent>
          </Tooltip>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Select value={vistaFiltro} onValueChange={setVistaFiltro}>
              <SelectTrigger className="w-[110px] h-9">
                <SelectValue placeholder="Vista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semana">Semana</SelectItem>
                <SelectItem value="mes">Mes</SelectItem>
              </SelectContent>
            </Select>
          </TooltipTrigger>
          <TooltipContent side="top">Cambiar vista</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Select
              value={centroId ? String(centroId) : ""}
              onValueChange={(v) => setCentroId(Number(v))}
              disabled={scopeLoading || centros.length === 0}
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Centro" />
              </SelectTrigger>
              <SelectContent>
                {centros.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nombre || c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TooltipTrigger>
          <TooltipContent side="top">Selecciona centro</TooltipContent>
        </Tooltip>

        {permCreate && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                onClick={onNew}
                className="gap-1 bg-[#5d16ec] hover:bg-[#5d16ec]/70 text-white"
              >
                <Plus size={14} />
                Nueva
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Nueva oportunidad</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}