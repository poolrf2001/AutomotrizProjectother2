"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
import "react-day-picker/dist/style.css";

export default function Paso3Horario({
  onChange,
  allowedCentros = [],
  allowedTalleres = [],
  initialValue = null,
}) {
  const [centros, setCentros] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const [asesores, setAsesores] = useState([]);

  const [centroId, setCentroId] = useState(null);
  const [tallerId, setTallerId] = useState(null);
  const [asesorId, setAsesorId] = useState("any");

  const [date, setDate] = useState(null);
  const [slot, setSlot] = useState(null);
  const [slots, setSlots] = useState([]);

  const [horario, setHorario] = useState(null);

  const initialAppliedRef = useRef(false);

  const parseTime = (t) => {
    if (!t) return 0;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (m) =>
    `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

  const DAY_ES = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  const DAY_EN = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  function parseDateFromValue(value) {
    if (!value) return null;
    const normalized = String(value).replace(" ", "T");
    const d = new Date(normalized);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function parseHourMinute(value) {
    if (!value) return null;
    const d = parseDateFromValue(value);
    if (!d) return null;
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  const allowedCentrosSet = useMemo(
    () => new Set((allowedCentros || []).map(Number)),
    [allowedCentros]
  );

  const allowedTalleresSet = useMemo(
    () => new Set((allowedTalleres || []).map(Number)),
    [allowedTalleres]
  );

  // cargar centros y filtrar por scope
  useEffect(() => {
    fetch("/api/centros", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const lista = Array.isArray(data) ? data : [];

        const filtrados =
          allowedCentrosSet.size > 0
            ? lista.filter((c) => allowedCentrosSet.has(Number(c.id)))
            : [];

        setCentros(filtrados);

        // si hay initialValue, priorizarlo
        if (
          initialValue?.centro_id &&
          filtrados.some((c) => Number(c.id) === Number(initialValue.centro_id))
        ) {
          setCentroId(Number(initialValue.centro_id));
          return;
        }

        setCentroId((prev) => {
          if (prev && filtrados.some((c) => Number(c.id) === Number(prev))) {
            return prev;
          }
          return filtrados.length > 0 ? Number(filtrados[0].id) : null;
        });
      })
      .catch((e) => {
        console.log(e);
        setCentros([]);
        setCentroId(null);
      });
  }, [allowedCentrosSet, initialValue?.centro_id]);

  // cargar talleres cuando cambia centro y filtrar por scope
  useEffect(() => {
    if (!centroId) {
      setTalleres([]);
      setTallerId(null);
      setDate(null);
      setSlot(null);
      setSlots([]);
      return;
    }

    setTalleres([]);
    setTallerId(null);
    setDate(null);
    setSlot(null);
    setSlots([]);

    fetch(`/api/talleres/bycentro?centro_id=${centroId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const lista = Array.isArray(data) ? data : [];

        const filtrados =
          allowedTalleresSet.size > 0
            ? lista.filter((t) => allowedTalleresSet.has(Number(t.id)))
            : [];

        setTalleres(filtrados);

        if (
          initialValue?.taller_id &&
          filtrados.some((t) => Number(t.id) === Number(initialValue.taller_id))
        ) {
          setTallerId(Number(initialValue.taller_id));
          return;
        }

        if (filtrados.length > 0) {
          setTallerId(Number(filtrados[0].id));
        } else {
          setTallerId(null);
        }
      })
      .catch((e) => {
        console.log(e);
        setTalleres([]);
        setTallerId(null);
      });
  }, [centroId, allowedTalleresSet, initialValue?.taller_id]);

  // cargar asesores
  useEffect(() => {
    fetch("/api/usuarios", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const validos = (Array.isArray(data) ? data : []).filter(
          (u) => u.is_active && u.work_schedule
        );
        setAsesores(validos);
      })
      .catch((e) => {
        console.log(e);
        setAsesores([]);
      });
  }, []);

  // cargar horario del centro
  useEffect(() => {
    if (!centroId) {
      setHorario(null);
      return;
    }

    fetch(`/api/horacitas_centro/by-centro/${centroId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setHorario(data))
      .catch((e) => {
        console.log(e);
        setHorario(null);
      });
  }, [centroId]);

  const isDayDisabled = (day) => {
    if (!horario?.week_json) return true;

    const key = DAY_ES[day.getDay()];
    const cfg = horario.week_json[key];

    if (!cfg?.active) return true;

    const todayMid = new Date();
    todayMid.setHours(0, 0, 0, 0);

    return day < todayMid;
  };

  // aplicar initialValue una sola vez cuando ya exista data suficiente
  useEffect(() => {
    if (initialAppliedRef.current) return;
    if (!initialValue) return;
    if (!centroId || !tallerId) return;

    const initialDate = parseDateFromValue(initialValue.start);
    const initialStart = parseHourMinute(initialValue.start);
    const initialEnd = parseHourMinute(initialValue.end);

    if (initialValue.asesor_id) {
      setAsesorId(String(initialValue.asesor_id));
    } else {
      setAsesorId("any");
    }

    if (initialDate) {
      setDate(initialDate);
    }

    if (initialStart && initialEnd) {
      setSlot({
        start: initialStart,
        end: initialEnd,
      });
    }

    initialAppliedRef.current = true;
  }, [initialValue, centroId, tallerId]);

  // generar slots
  useEffect(() => {
    if (!date || !horario || !tallerId) {
      setSlots([]);
      return;
    }

    const key = DAY_ES[date.getDay()];
    const cfgCentro = horario.week_json?.[key];

    if (!cfgCentro?.active) {
      setSlots([]);
      return;
    }

    let start = parseTime(cfgCentro.start);
    let end = parseTime(cfgCentro.end);

    if (asesorId !== "any") {
      const asesor = asesores.find((a) => String(a.id) === asesorId);

      if (asesor?.work_schedule) {
        try {
          const schedule =
            typeof asesor.work_schedule === "string"
              ? JSON.parse(asesor.work_schedule)
              : asesor.work_schedule;

          const keyEn = DAY_EN[date.getDay()];
          const cfgAsesor = schedule?.[keyEn];

          if (!cfgAsesor) {
            setSlots([]);
            return;
          }

          const aStart = parseTime(cfgAsesor.start);
          const aEnd = parseTime(cfgAsesor.end);

          start = Math.max(start, aStart);
          end = Math.min(end, aEnd);
        } catch (e) {
          console.log(e);
          setSlots([]);
          return;
        }
      }
    }

    const arr = [];
    const now = new Date();

    for (let m = start; m < end; m += horario.slot_minutes) {
      const slotDate = new Date(date);
      slotDate.setHours(Math.floor(m / 60), m % 60, 0, 0);

      const isInitialSlot =
        initialValue &&
        parseDateFromValue(initialValue.start)?.toDateString() === date.toDateString() &&
        parseHourMinute(initialValue.start) === minutesToTime(m);

      if (slotDate < now && !isInitialSlot) continue;

      arr.push({
        start: minutesToTime(m),
        end: minutesToTime(m + horario.slot_minutes),
      });
    }

    setSlots(arr);
  }, [date, asesorId, horario, tallerId, asesores, initialValue]);

  // asegurar que el slot inicial exista en la lista si no entró por timing
  useEffect(() => {
    if (!initialValue || !date || !slot) return;

    const initialStart = parseHourMinute(initialValue.start);
    const alreadyExists = slots.some((s) => s.start === initialStart);

    if (!alreadyExists && initialStart === slot.start) {
      setSlots((prev) => {
        const next = [...prev, slot];
        next.sort((a, b) => a.start.localeCompare(b.start));
        return next;
      });
    }
  }, [slots, initialValue, date, slot]);

  // emitir selección final
  useEffect(() => {
    if (!slot || !date || !centroId || !tallerId) return;

    const day = date.toISOString().slice(0, 10);

    onChange({
      centro_id: centroId,
      taller_id: tallerId,
      asesor_id: asesorId === "any" ? null : Number(asesorId),
      start: `${day} ${slot.start}:00`,
      end: `${day} ${slot.end}:00`,
    });
  }, [slot, date, centroId, tallerId, asesorId, onChange]);

  return (
    <Card>
      <CardHeader className="font-semibold">
        PASO 3 — Seleccione fecha y hora
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex justify-between gap-3 flex-wrap">
          {/* CENTRO */}
          <Select
            value={centroId ? String(centroId) : undefined}
            onValueChange={(v) => {
              initialAppliedRef.current = false;
              setCentroId(Number(v));
            }}
            disabled={centros.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un centro" />
            </SelectTrigger>
            <SelectContent>
              {centros.length > 0 ? (
                centros.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nombre || c.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="__sin_centros" disabled>
                  No tienes centros asignados
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          {/* TALLER */}
          <Select
            key={`taller-${centroId || "none"}`}
            value={tallerId ? String(tallerId) : undefined}
            onValueChange={(v) => {
              initialAppliedRef.current = false;
              setTallerId(Number(v));
              setDate(null);
              setSlot(null);
              setSlots([]);
            }}
            disabled={!centroId || talleres.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un taller" />
            </SelectTrigger>
            <SelectContent>
              {talleres.length > 0 ? (
                talleres.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.nombre || t.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="__sin_taller" disabled>
                  No tienes talleres asignados
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          {/* ASESOR */}
          <Select
            value={asesorId}
            onValueChange={(v) => {
              initialAppliedRef.current = false;
              setAsesorId(v);
              setSlot(null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione asesor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Cualquier asesor</SelectItem>
              {asesores.map((a) => (
                <SelectItem key={a.id} value={String(a.id)}>
                  {a.fullname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* CALENDARIO */}
          <div className="border rounded-xl p-4 shadow-sm bg-white">
            <DayPicker
              mode="single"
              selected={date}
              onSelect={(d) => {
                initialAppliedRef.current = false;
                setDate(d);
                setSlot(null);
              }}
              locale={es}
              fromDate={new Date()}
              disabled={isDayDisabled}
              className="mx-auto"
            />
          </div>

          {/* HORAS */}
          <div className="space-y-4">
            {slots.length > 0 && (
              <div>
                <div className="font-medium mb-2">Seleccione la hora</div>
                <div className="flex flex-wrap gap-2">
                  {slots.map((s) => (
                    <Button
                      key={s.start}
                      type="button"
                      size="sm"
                      variant={slot?.start === s.start ? "default" : "outline"}
                      onClick={() => setSlot(s)}
                    >
                      {s.start}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {slots.length === 0 && date && (
              <p className="text-sm text-muted-foreground">
                No hay horarios disponibles
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}