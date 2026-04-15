"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  addDays,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertCircle,
  Loader,
  Calendar as CalendarIcon,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { hasPermission } from "@/lib/permissions";
import { useUserScope } from "@/hooks/useUserScope";

import AgendaHeader from "@/app/components/agendaview/AgendaHeader";
import AgendaFilters from "@/app/components/agendaview/AgendaFilters";
import AgendaWeekView from "@/app/components/agendaview/AgendaWeekView";
import AgendaMonthView from "@/app/components/agendaview/AgendaMonthView";
import AgendaDialogs from "@/app/components/agendaview/AgendaDialogs";

const FILTER_TODAY = "hoy";
const FILTER_THIS_WEEK = "esta_semana";
const FILTER_THIS_MONTH = "este_mes";

export default function AgendaPage() {
  const { permissions } = useAuth();
  const permView = hasPermission(permissions, "agenda", "view");
  const permCreate = hasPermission(permissions, "agenda", "create");

  const menuRef = useRef(null);

  const {
    centros: userCentros,
    talleres: userTalleres,
    loading: scopeLoading,
  } = useUserScope();

  const [centros, setCentros] = useState([]);
  const [centroId, setCentroId] = useState(null);

  const [horario, setHorario] = useState(null);
  const [slots, setSlots] = useState([]);
  const [oportunidades, setOportunidades] = useState([]);
  const [estadosTiempo, setEstadosTiempo] = useState([]);

  const [createdByFilter, setCreatedByFilter] = useState("all");
  const [assignedToFilter, setAssignedToFilter] = useState("all");
  const [clienteFilter, setClienteFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [vistaFiltro, setVistaFiltro] = useState("semana");

  const [clienteSearchOpen, setClienteSearchOpen] = useState(false);
  const [clienteSearch, setClienteSearch] = useState("");

  const [openOportunidadDialog, setOpenOportunidadDialog] = useState(false);
  const [dialogType, setDialogType] = useState("op");
  const [dialogDefaults, setDialogDefaults] = useState({
    fecha: "",
    hora: "",
    oportunidadPadreId: "",
  });

  const [selectedOportunidad, setSelectedOportunidad] = useState(null);
  const [menuCell, setMenuCell] = useState(null);

  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [monthStart, setMonthStart] = useState(startOfMonth(new Date()));

  const days = useMemo(() => {
    if (vistaFiltro === "semana") {
      return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    }
    return eachDayOfInterval({
      start: monthStart,
      end: endOfMonth(monthStart),
    });
  }, [vistaFiltro, weekStart, monthStart]);

  useEffect(() => {
    fetch("/api/configuracion-estados-tiempo", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setEstadosTiempo(Array.isArray(data) ? data : []))
      .catch(() => setEstadosTiempo([]));
  }, []);

  useEffect(() => {
    function close(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuCell(null);
      }
    }

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (scopeLoading) return;

    fetch("/api/centros", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const lista = Array.isArray(data) ? data : [];
        const filtrados =
          userCentros.length > 0
            ? lista.filter((c) => userCentros.includes(Number(c.id)))
            : [];

        setCentros(filtrados);
        setCentroId((prev) => {
          if (prev && filtrados.some((c) => Number(c.id) === Number(prev))) {
            return prev;
          }
          return filtrados.length > 0 ? Number(filtrados[0].id) : null;
        });
      })
      .catch(() => {
        setCentros([]);
        setCentroId(null);
      });
  }, [scopeLoading, userCentros]);

  useEffect(() => {
    if (!centroId) {
      setHorario(null);
      return;
    }

    fetch(`/api/agendacitas_centro/by-centro/${centroId}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then(setHorario)
      .catch(() => setHorario(null));
  }, [centroId]);

  useEffect(() => {
    if (!horario?.week_json) {
      setSlots([]);
      return;
    }

    const minutes = Number(horario.slot_minutes || 30);
    const activos = Object.values(horario.week_json).filter((d) => d?.active);

    if (!activos.length) {
      setSlots([]);
      return;
    }

    let minStart = "23:59";
    let maxEnd = "00:00";

    activos.forEach((d) => {
      if (d.start < minStart) minStart = d.start;
      if (d.end > maxEnd) maxEnd = d.end;
    });

    const arr = [];
    let [h, m] = minStart.split(":").map(Number);
    const [eh, em] = maxEnd.split(":").map(Number);

    while (h < eh || (h === eh && m < em)) {
      arr.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      m += minutes;
      if (m >= 60) {
        h++;
        m -= 60;
      }
    }

    setSlots(arr);
  }, [horario]);

  async function loadOportunidades() {
    try {
      const fecha_desde = format(days[0], "yyyy-MM-dd");
      const fecha_hasta = format(days[days.length - 1], "yyyy-MM-dd");

      const resOp = await fetch(`/api/oportunidades-oportunidades?limit=1000`, {
        cache: "no-store",
      });

      const dataOp = await resOp.json();
      let listaOp = Array.isArray(dataOp?.data) ? dataOp.data : [];

      listaOp = await Promise.all(
        listaOp.map(async (opp) => {
          try {
            const resDetalles = await fetch(
              `/api/oportunidades-oportunidades/${opp.id}/detalles?limit=1`,
              { cache: "no-store" }
            );
            const dataDetalles = await resDetalles.json();
            const detalle = Array.isArray(dataDetalles?.data)
              ? dataDetalles.data[0]
              : null;

            const resActividades = await fetch(
              `/api/actividades-oportunidades?oportunidad_id=${opp.id}`,
              { cache: "no-store" }
            );
            const dataActividades = await resActividades.json();
            const actividades = Array.isArray(dataActividades) ? dataActividades : [];
            const ultimaActividad =
              actividades.length > 0 ? actividades[actividades.length - 1] : null;

            return {
              ...opp,
              fecha_agenda: detalle?.fecha_agenda || null,
              hora_agenda: detalle?.hora_agenda || null,
              oportunidad_padre_id: detalle?.oportunidad_padre_id || null,
              ultima_actividad_detalle: ultimaActividad?.detalle || null,
              ultima_actividad_usuario: ultimaActividad?.created_by_name || null,
              cliente_name: opp.cliente_nombre,
              etapa_name: opp.etapa_nombre,
              created_by_name: opp.creado_por_nombre,
              asignado_a_name: opp.asignado_a_nombre,
            };
          } catch (error) {
            console.error(`Error cargando detalles de oportunidad ${opp.id}:`, error);
            return {
              ...opp,
              fecha_agenda: null,
              hora_agenda: null,
              oportunidad_padre_id: null,
              ultima_actividad_detalle: null,
              ultima_actividad_usuario: null,
              cliente_name: opp.cliente_nombre,
              etapa_name: opp.etapa_nombre,
              created_by_name: opp.creado_por_nombre,
              asignado_a_name: opp.asignado_a_nombre,
            };
          }
        })
      );

      if (tipoFilter === "op") {
        listaOp = listaOp.filter((o) => getTipoCodigo(o.oportunidad_id) === "op");
      } else if (tipoFilter === "ld") {
        listaOp = listaOp.filter((o) => getTipoCodigo(o.oportunidad_id) === "ld");
      }

      if (userTalleres.length > 0) {
        listaOp = listaOp.filter((o) => {
          if (o.taller_id == null) return true;
          return userTalleres.includes(Number(o.taller_id));
        });
      }

      listaOp = listaOp.filter((o) => {
        if (!o.fecha_agenda) return false;
        const fechaOpp = normalizeDate(o.fecha_agenda);
        return fechaOpp >= fecha_desde && fechaOpp <= fecha_hasta;
      });

      listaOp.sort((a, b) => {
        const fa = `${normalizeDate(a.fecha_agenda)} ${String(a.hora_agenda || "").slice(0, 8)}`;
        const fb = `${normalizeDate(b.fecha_agenda)} ${String(b.hora_agenda || "").slice(0, 8)}`;
        if (fa < fb) return -1;
        if (fa > fb) return 1;
        return Number(a.id || 0) - Number(b.id || 0);
      });

      setOportunidades(listaOp);
    } catch (error) {
      console.error("Error cargando oportunidades:", error);
      setOportunidades([]);
    }
  }

  useEffect(() => {
    if (scopeLoading) return;
    loadOportunidades();
  }, [weekStart, monthStart, vistaFiltro, scopeLoading, tipoFilter, centroId]);

  function normalizeDate(value) {
    if (!value) return "";
    return String(value).trim().slice(0, 10);
  }

  function getTipoCodigo(codigo) {
    const value = String(codigo || "").trim().toUpperCase();
    if (/^OPO-\d+-\d+$/.test(value)) return "op";
    if (/^LD-\d+-\d+$/.test(value)) return "ld";
    return "other";
  }

  function toMinutesFromHourString(value) {
    if (!value) return null;
    const parts = String(value).trim().split(":");
    const hh = Number(parts[0] || 0);
    const mm = Number(parts[1] || 0);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    return hh * 60 + mm;
  }

  function getSlotRange(slotHour) {
    const start = toMinutesFromHourString(slotHour);
    const duration = Number(horario?.slot_minutes || 30);
    if (start == null) return null;
    return { start, end: start + duration };
  }

  function enabled(day, hour) {
    if (!horario) return true;
    const dayMap = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    const cfg = horario.week_json?.[dayMap[day.getDay()]];
    if (!cfg?.active) return false;

    const slotMinutes = toMinutesFromHourString(hour);
    const startMinutes = toMinutesFromHourString(cfg.start);
    const endMinutes = toMinutesFromHourString(cfg.end);

    if (slotMinutes == null || startMinutes == null || endMinutes == null) return false;
    return slotMinutes >= startMinutes && slotMinutes < endMinutes;
  }

  function past(day, hour) {
    const now = new Date();
    const minutes = toMinutesFromHourString(hour);
    if (minutes == null) return false;

    const hh = Math.floor(minutes / 60);
    const mm = minutes % 60;
    const slotDate = new Date(day);
    slotDate.setHours(hh, mm, 0, 0);

    return slotDate < now;
  }

  function getOportunidades(day, hour) {
    const date = format(day, "yyyy-MM-dd");
    const slotRange = getSlotRange(hour);
    if (!slotRange) return [];

    return filteredOportunidades.filter((o) => {
      const fecha = normalizeDate(o.fecha_agenda);
      const minutosOportunidad = toMinutesFromHourString(o.hora_agenda);

      if (!fecha || minutosOportunidad == null) return false;
      if (fecha !== date) return false;

      return minutosOportunidad >= slotRange.start && minutosOportunidad < slotRange.end;
    });
  }

  function isNuevoStage(oportunidad) {
    const etapa = String(oportunidad?.etapa_nombre || "").trim().toLowerCase();
    return etapa === "nuevo";
  }

  function shouldPaintAsReprogramado(oportunidad) {
    const hasPadre =
      oportunidad?.oportunidad_padre_id !== null &&
      oportunidad?.oportunidad_padre_id !== undefined &&
      String(oportunidad.oportunidad_padre_id).trim() !== "";
    return hasPadre && isNuevoStage(oportunidad);
  }

  function getVisualColor(oportunidad) {
    if (shouldPaintAsReprogramado(oportunidad)) return "#8b5cf6";
    const tipo = getTipoCodigo(oportunidad?.oportunidad_id);
    if (tipo === "ld") return "#0ea5e9";
    if (typeof oportunidad?.etapa_color === "string" && oportunidad.etapa_color.trim()) {
      return oportunidad.etapa_color.trim();
    }
    return "#f97316";
  }

  function getCardStyle(oportunidad) {
    const safeColor = getVisualColor(oportunidad);
    return {
      borderLeft: `4px solid ${safeColor}`,
      backgroundColor: `${safeColor}15`,
    };
  }

  function getEtapaVisualText(oportunidad) {
    if (shouldPaintAsReprogramado(oportunidad)) return "Reprogramado";
    return oportunidad?.etapa_nombre || oportunidad?.origen_nombre || "-";
  }

  function getMinutosRestantes(fechaAgenda, horaAgenda) {
    if (!fechaAgenda || !horaAgenda) return null;
    try {
      const fechaStr = String(fechaAgenda).trim().split("T")[0];
      const horaStr = String(horaAgenda).trim().split(":").slice(0, 2).join(":");
      const fechaHoraString = `${fechaStr}T${horaStr}:00`;

      const ahora = new Date();
      const agendaDateTime = new Date(fechaHoraString);

      if (isNaN(agendaDateTime.getTime())) return null;

      const diferencia = agendaDateTime.getTime() - ahora.getTime();
      return Math.floor(diferencia / 1000 / 60);
    } catch {
      return null;
    }
  }

  function getColorEstadoTiempo(minutosRestantes, etapasconversion_id) {
    if (etapasconversion_id !== 1 && etapasconversion_id !== 2) return "#28a745";
    if (minutosRestantes === null) return "#6b7280";

    const estadoActivo = estadosTiempo.find(
      (e) =>
        e.activo &&
        minutosRestantes >= e.minutos_desde &&
        minutosRestantes <= e.minutos_hasta
    );

    return estadoActivo?.color_hexadecimal || "#6b7280";
  }

  function openMenu(day, hour, e) {
    e.stopPropagation();
    setMenuCell({
      day: format(day, "yyyy-MM-dd"),
      hour,
    });
  }

  const createdByOptions = useMemo(() => {
    const map = new Map();
    oportunidades.forEach((o) => {
      if (o.created_by && o.created_by_name) {
        map.set(String(o.created_by), {
          id: String(o.created_by),
          name: o.created_by_name,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "es", { sensitivity: "base" })
    );
  }, [oportunidades]);

  const assignedToOptions = useMemo(() => {
    const map = new Map();
    oportunidades.forEach((o) => {
      if (o.asignado_a && o.asignado_a_name) {
        map.set(String(o.asignado_a), {
          id: String(o.asignado_a),
          name: o.asignado_a_name,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "es", { sensitivity: "base" })
    );
  }, [oportunidades]);

  const clienteOptions = useMemo(() => {
    const map = new Map();
    oportunidades.forEach((o) => {
      if (o.cliente_name) {
        map.set(o.cliente_name, { id: o.cliente_name, name: o.cliente_name });
      }
    });
    return Array.from(map.values())
      .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }))
      .slice(0, 100);
  }, [oportunidades]);

  const filteredClienteOptions = useMemo(() => {
    if (!clienteSearch.trim()) return clienteOptions;
    return clienteOptions.filter((c) =>
      c.name.toLowerCase().includes(clienteSearch.toLowerCase())
    );
  }, [clienteOptions, clienteSearch]);

  const filteredOportunidades = useMemo(() => {
    return oportunidades.filter((o) => {
      const matchesCreatedBy =
        createdByFilter === "all" || String(o.created_by) === String(createdByFilter);

      const matchesAssignedTo =
        assignedToFilter === "all" || String(o.asignado_a) === String(assignedToFilter);

      const matchesCliente =
        clienteFilter === "all" || String(o.cliente_name) === String(clienteFilter);

      return matchesCreatedBy && matchesAssignedTo && matchesCliente;
    });
  }, [oportunidades, createdByFilter, assignedToFilter, clienteFilter]);

  const daysInView = days;

  if (!permView) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-700">No tienes permiso para ver la agenda.</p>
      </div>
    );
  }

  const canShowGrid = !scopeLoading && !!centroId;
  const hasActiveFilters =
    clienteFilter !== "all" ||
    createdByFilter !== "all" ||
    assignedToFilter !== "all" ||
    tipoFilter !== "all";

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col gap-3 p-4 bg-white">
        <AgendaHeader
          days={days}
          monthStart={monthStart}
          vistaFiltro={vistaFiltro}
          setVistaFiltro={setVistaFiltro}
          weekStart={weekStart}
          setWeekStart={setWeekStart}
          setMonthStart={setMonthStart}
          startOfWeek={startOfWeek}
          startOfMonth={startOfMonth}
          subWeeks={subWeeks}
          addWeeks={addWeeks}
          subMonths={subMonths}
          addMonths={addMonths}
          format={format}
          es={es}
          scopeLoading={scopeLoading}
          centros={centros}
          centroId={centroId}
          setCentroId={setCentroId}
          permCreate={permCreate}
          onNew={() => {
            setSelectedOportunidad(null);
            setDialogType("op");
            setDialogDefaults({
              fecha: format(new Date(), "yyyy-MM-dd"),
              hora: "",
              oportunidadPadreId: "",
            });
            setOpenOportunidadDialog(true);
          }}
        />

        <AgendaFilters
          createdByFilter={createdByFilter}
          setCreatedByFilter={setCreatedByFilter}
          assignedToFilter={assignedToFilter}
          setAssignedToFilter={setAssignedToFilter}
          clienteFilter={clienteFilter}
          setClienteFilter={setClienteFilter}
          clienteSearchOpen={clienteSearchOpen}
          setClienteSearchOpen={setClienteSearchOpen}
          clienteSearch={clienteSearch}
          setClienteSearch={setClienteSearch}
          filteredClienteOptions={filteredClienteOptions}
          tipoFilter={tipoFilter}
          setTipoFilter={setTipoFilter}
          hasActiveFilters={hasActiveFilters}
          onClear={() => {
            setClienteFilter("all");
            setClienteSearch("");
            setCreatedByFilter("all");
            setAssignedToFilter("all");
            setTipoFilter("all");
          }}
          createdByOptions={createdByOptions}
          assignedToOptions={assignedToOptions}
        />

        {!scopeLoading && centros.length === 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-700">No tienes centros asignados.</p>
          </div>
        )}

        {scopeLoading && (
          <div className="flex-1 flex justify-center items-center">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        )}

        {canShowGrid && (
          vistaFiltro === "mes" ? (
            <AgendaMonthView
              days={daysInView}
              filteredOportunidades={filteredOportunidades}
              permCreate={permCreate}
              openMenu={openMenu}
              menuCell={menuCell}
              menuRef={menuRef}
              setMenuCell={setMenuCell}
              setSelectedOportunidad={setSelectedOportunidad}
              setDialogType={setDialogType}
              setDialogDefaults={setDialogDefaults}
              setOpenOportunidadDialog={setOpenOportunidadDialog}
              getTipoCodigo={getTipoCodigo}
              getCardStyle={getCardStyle}
              getMinutosRestantes={getMinutosRestantes}
              getColorEstadoTiempo={getColorEstadoTiempo}
            />
          ) : (
            <AgendaWeekView
              days={daysInView}
              slots={slots}
              filteredOportunidades={filteredOportunidades}
              permCreate={permCreate}
              enabled={enabled}
              past={past}
              openMenu={openMenu}
              menuCell={menuCell}
              menuRef={menuRef}
              setMenuCell={setMenuCell}
              setSelectedOportunidad={setSelectedOportunidad}
              setDialogType={setDialogType}
              setDialogDefaults={setDialogDefaults}
              setOpenOportunidadDialog={setOpenOportunidadDialog}
              getTipoCodigo={getTipoCodigo}
              getCardStyle={getCardStyle}
              getMinutosRestantes={getMinutosRestantes}
              getColorEstadoTiempo={getColorEstadoTiempo}
            />
          )
        )}

        <AgendaDialogs
          openOportunidadDialog={openOportunidadDialog}
          setOpenOportunidadDialog={setOpenOportunidadDialog}
          dialogDefaults={dialogDefaults}
          selectedOportunidad={selectedOportunidad}
          dialogType={dialogType}
          setSelectedOportunidad={setSelectedOportunidad}
          setDialogDefaults={setDialogDefaults}
          loadOportunidades={loadOportunidades}
        />
      </div>
    </TooltipProvider>
  );
}