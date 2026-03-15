"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  addDays,
} from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

import UserAbsenceDialog from "@/app/components/user-absences/AbsenceDialog";
import AbsencesSheet from "@/app/components/user-absences/AbsencesSheet";
import CitaResumenDialog from "@/app/components/citas/CitaResumenDialog";
import { useUserScope } from "@/hooks/useUserScope";

export default function CitasPage() {
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

  const [citas, setCitas] = useState([]);
  const [ausencias, setAusencias] = useState([]);

  const [asesores, setAsesores] = useState([]);
  const [asesorFiltro, setAsesorFiltro] = useState("all");
  const [estadoFiltro, setEstadoFiltro] = useState("all");

  const [openAbsences, setOpenAbsences] = useState(false);
  const [openAbsence, setOpenAbsence] = useState(false);
  const [openResumen, setOpenResumen] = useState(false);

  const [selectedCita, setSelectedCita] = useState(null);
  const [selectedAbsence, setSelectedAbsence] = useState(null);

  const [menuCell, setMenuCell] = useState(null);

  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    function close(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuCell(null);
      }
    }

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // ===== LOAD CENTROS =====
  useEffect(() => {
    if (scopeLoading) return;

    fetch("/api/centros")
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
          return filtrados.length ? Number(filtrados[0].id) : null;
        });
      })
      .catch(() => {
        setCentros([]);
        setCentroId(null);
      });
  }, [scopeLoading, userCentros]);

  // ===== LOAD ASESORES =====
  useEffect(() => {
    fetch("/api/usuarios")
      .then((r) => r.json())
      .then((data) => setAsesores(Array.isArray(data) ? data : []))
      .catch(() => setAsesores([]));
  }, []);

  // ===== LOAD HORARIO =====
  useEffect(() => {
    if (!centroId) {
      setHorario(null);
      return;
    }

    if (userCentros.length > 0 && !userCentros.includes(Number(centroId))) {
      setHorario(null);
      return;
    }

    fetch(`/api/horacitas_centro/by-centro/${centroId}`)
      .then((r) => r.json())
      .then(setHorario)
      .catch(() => setHorario(null));
  }, [centroId, userCentros]);

  // ===== GENERAR SLOTS =====
  useEffect(() => {
    if (!horario?.week_json) {
      setSlots([]);
      return;
    }

    const minutes = horario.slot_minutes || 30;
    const firstActive = Object.values(horario.week_json).find((d) => d.active);

    if (!firstActive) {
      setSlots([]);
      return;
    }

    const arr = [];
    let [h, m] = firstActive.start.split(":").map(Number);
    const [eh, em] = firstActive.end.split(":").map(Number);

    while (h < eh || (h === eh && m < em)) {
      arr.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      );
      m += minutes;
      if (m >= 60) {
        h++;
        m -= 60;
      }
    }

    setSlots(arr);
  }, [horario]);

  // ===== LOAD CITAS =====
  async function loadCitas() {
    if (!centroId) {
      setCitas([]);
      return;
    }

    if (userCentros.length > 0 && !userCentros.includes(Number(centroId))) {
      setCitas([]);
      return;
    }

    const start = format(days[0], "yyyy-MM-dd");
    const end = format(days[6], "yyyy-MM-dd");

    try {
      const r = await fetch(
        `/api/citas?centro_id=${centroId}&start=${start}&end=${end}`,
        { cache: "no-store" }
      );
      const data = await r.json();

      let lista = [];
      if (Array.isArray(data)) lista = data;
      else if (Array.isArray(data?.rows)) lista = data.rows;

      // si el backend devuelve taller_id, se filtra por talleres permitidos
      if (userTalleres.length > 0) {
        lista = lista.filter((c) => {
          if (c.taller_id == null) return true;
          return userTalleres.includes(Number(c.taller_id));
        });
      }

      setCitas(lista);
    } catch {
      setCitas([]);
    }
  }

  useEffect(() => {
    if (scopeLoading) return;
    loadCitas();
  }, [centroId, weekStart, scopeLoading, userCentros, userTalleres]);

  // ===== LOAD AUSENCIAS =====
  async function loadAusencias() {
    if (!centroId) {
      setAusencias([]);
      return;
    }

    if (userCentros.length > 0 && !userCentros.includes(Number(centroId))) {
      setAusencias([]);
      return;
    }

    const start = format(days[0], "yyyy-MM-dd");
    const end = format(days[6], "yyyy-MM-dd");

    try {
      const r = await fetch(
        `/api/user-absences?centro_id=${centroId}&start=${start}&end=${end}`,
        { cache: "no-store" }
      );
      const data = await r.json();

      if (Array.isArray(data)) setAusencias(data);
      else if (Array.isArray(data?.rows)) setAusencias(data.rows);
      else setAusencias([]);
    } catch {
      setAusencias([]);
    }
  }

  useEffect(() => {
    if (scopeLoading) return;
    loadAusencias();
  }, [centroId, weekStart, scopeLoading, userCentros]);

  // ===== HELPERS =====
  const dayMap = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];

  function enabled(day, hour) {
    if (!horario) return true;
    const cfg = horario.week_json?.[dayMap[day.getDay()]];
    if (!cfg?.active) return false;
    return hour >= cfg.start && hour < cfg.end;
  }

  function past(day, hour) {
    const now = new Date();
    const slot = new Date(`${format(day, "yyyy-MM-dd")}T${hour}`);
    return slot < now;
  }

  function toLocalHour(date) {
    return new Date(date).toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  function toLocalDate(date) {
    return new Date(date).toISOString().slice(0, 10);
  }

  function getCitas(day, hour) {
    const date = format(day, "yyyy-MM-dd");

    return citas.filter((c) => {
      if (asesorFiltro !== "all" && String(c.asesor_id) !== String(asesorFiltro)) {
        return false;
      }

      if (estadoFiltro !== "all" && c.estado !== estadoFiltro) {
        return false;
      }

      return (
        toLocalDate(c.start_at) === date &&
        toLocalHour(c.start_at) === hour
      );
    });
  }

  function openMenu(day, hour, e) {
    e.stopPropagation();
    setMenuCell({
      day: format(day, "yyyy-MM-dd"),
      hour,
    });
  }

  function openCita(c) {
    setSelectedCita(c);
    setOpenResumen(true);
  }

  // ===== AUSENCIAS =====
  function editarAusencia(a) {
    setSelectedAbsence(a);
    setOpenAbsence(true);
    setOpenAbsences(false);
  }

  async function eliminarAusencia(id) {
    if (!confirm("¿Eliminar ausencia?")) return;

    try {
      await fetch(`/api/user-absences/${id}`, {
        method: "DELETE",
      });

      setAusencias((prev) => prev.filter((a) => a.id !== id));
    } catch {
      console.log("No se pudo eliminar");
    }
  }

  const canShowGrid = !scopeLoading && !!centroId;

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="font-semibold">
          {format(days[0], "dd MMM", { locale: es })} -{" "}
          {format(days[6], "dd MMM", { locale: es })}
        </span>

        <Button
          size="icon"
          onClick={() => setWeekStart(subWeeks(weekStart, 1))}
        >
          <ChevronLeft />
        </Button>

        <Button
          size="icon"
          onClick={() => setWeekStart(addWeeks(weekStart, 1))}
        >
          <ChevronRight />
        </Button>

        <Button
          onClick={() =>
            setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
          }
        >
          Hoy
        </Button>

        <Select
          value={centroId ? String(centroId) : ""}
          onValueChange={(v) => setCentroId(Number(v))}
          disabled={scopeLoading || centros.length === 0}
        >
          <SelectTrigger className="w-[180px]">
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

        <Select value={asesorFiltro} onValueChange={setAsesorFiltro}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Asesor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {asesores.map((a) => (
              <SelectItem key={a.id} value={String(a.id)}>
                {a.fullname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="confirmada">Confirmada</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
            <SelectItem value="reprogramada">Reprogramada</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            onClick={() => (window.location.href = "/citas/nueva")}
            disabled={!centroId}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Nueva cita
          </Button>

          <Button variant="outline" onClick={() => setOpenAbsences(true)} disabled={!centroId}>
            Ver ausencias
          </Button>
        </div>
      </div>

      {!scopeLoading && centros.length === 0 && (
        <div className="border rounded-md p-4 text-sm text-muted-foreground">
          No tienes centros asignados.
        </div>
      )}

      {/* GRID */}
      {canShowGrid && (
        <div className="border rounded overflow-hidden">
          {/* DIAS */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)]">
            <div />
            {days.map((d) => (
              <div key={d.toISOString()} className="p-2 text-center font-medium border-l">
                {format(d, "EEEE dd", { locale: es })}
              </div>
            ))}
          </div>

          {/* HORAS */}
          {slots.map((h) => (
            <div key={h} className="grid grid-cols-[80px_repeat(7,1fr)]">
              <div className="border-t p-2 text-sm text-gray-500">{h}</div>

              {days.map((d) => {
                const citasSlot = getCitas(d, h);
                const blocked = !enabled(d, h) || past(d, h);
                const dayString = format(d, "yyyy-MM-dd");

                return (
                  <div
                    key={`${dayString}-${h}`}
                    className={`border-t border-l h-16 relative ${
                      blocked
                        ? "bg-gray-100 cursor-not-allowed"
                        : "hover:bg-[#5e17eb]/10 cursor-pointer"
                    }`}
                    onClick={(e) => {
                      if (citasSlot.length) return openCita(citasSlot[0]);
                      if (blocked) return;
                      openMenu(d, h, e);
                    }}
                  >
                    {/* CITAS */}
                    {citasSlot.map((c, i) => (
                      <div
                        key={i}
                        className="absolute inset-1 rounded shadow border text-[10px] p-1 overflow-hidden bg-white"
                      >
                        <div
                          className="h-1 mb-1 rounded"
                          style={{ background: c.color || "#5e17eb" }}
                        />
                        <div className="font-semibold">{c.placa}</div>
                        <div className="truncate">{c.cliente}</div>
                        <div className="truncate">{c.asesor}</div>
                        <div className="text-[9px]">{c.estado}</div>
                      </div>
                    ))}

                    {/* MENU */}
                    {menuCell &&
                      menuCell.day === dayString &&
                      menuCell.hour === h && (
                        <div
                          ref={menuRef}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute z-10 bg-white border rounded shadow p-2 top-2 left-2 w-40"
                        >
                          <button
                            className="block w-full text-left hover:bg-gray-100 px-2 py-1"
                            onClick={() => {
                              window.location.href = "/citas/nueva";
                            }}
                          >
                            Nueva cita
                          </button>

                          <button
                            className="block w-full text-left hover:bg-gray-100 px-2 py-1"
                            onClick={() => {
                              setMenuCell(null);
                              setSelectedAbsence(null);
                              setOpenAbsence(true);
                            }}
                          >
                            Agendar ausencia
                          </button>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <UserAbsenceDialog
        key={selectedAbsence?.id || "new"}
        open={openAbsence}
        onOpenChange={(v) => {
          setOpenAbsence(v);
          if (!v) setSelectedAbsence(null);
        }}
        fullname="Oscar"
        absence={selectedAbsence}
        onSaved={loadAusencias}
      />

      <CitaResumenDialog
        open={openResumen}
        onOpenChange={(v) => {
          setOpenResumen(v);
          if (!v) setSelectedCita(null);
        }}
        cita={selectedCita}
      />

      <AbsencesSheet
        open={openAbsences}
        onOpenChange={setOpenAbsences}
        ausencias={ausencias}
        onEdit={editarAusencia}
        onDelete={eliminarAusencia}
      />
    </div>
  );
}