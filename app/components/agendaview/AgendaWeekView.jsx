"use client";

import { format } from "date-fns";
import AgendaDayCard from "./AgendaDayCard";

export default function AgendaWeekView({
  days,
  slots,
  filteredOportunidades,
  permCreate,
  enabled,
  past,
  openMenu,
  menuCell,
  menuRef,
  setMenuCell,
  setSelectedOportunidad,
  setDialogType,
  setDialogDefaults,
  setOpenOportunidadDialog,
  getTipoCodigo,
  getCardStyle,
  getMinutosRestantes,
  getColorEstadoTiempo,
}) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm flex flex-col h-full">
      <div className="grid grid-cols-[60px_repeat(7,1fr)] bg-gradient-to-r from-slate-50 to-slate-100 flex-shrink-0">
        <div className="p-1 font-semibold text-slate-700 text-xs" />
        {days.map((d) => (
          <div
            key={d.toISOString()}
            className="p-1 text-center font-semibold text-slate-700 border-l capitalize text-xs"
          >
            {format(d, "EEE")}
            <div className="text-[10px] font-normal">{format(d, "dd")}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {slots.map((h) => (
          <div key={h} className="grid grid-cols-[60px_repeat(7,1fr)]">
            <div className="border-t p-1 text-[10px] font-semibold text-slate-600 bg-slate-50 flex-shrink-0">
              {h}
            </div>

            {days.map((d) => {
              const oportunidadesSlot = filteredOportunidades.filter((o) => {
                const date = format(d, "yyyy-MM-dd");
                const fecha = String(o.fecha_agenda || "").trim().slice(0, 10);
                const minutos = (() => {
                  const parts = String(o.hora_agenda || "").trim().split(":");
                  const hh = Number(parts[0] || 0);
                  const mm = Number(parts[1] || 0);
                  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
                  return hh * 60 + mm;
                })();

                const slotParts = h.split(":").map(Number);
                const slotMinutes = slotParts[0] * 60 + slotParts[1];
                const duration = 30;

                if (!fecha || minutos == null) return false;
                if (fecha !== date) return false;

                return minutos >= slotMinutes && minutos < slotMinutes + duration;
              });

              const blocked = !enabled(d, h) || past(d, h);
              const dayString = format(d, "yyyy-MM-dd");

              return (
                <div
                  key={`${dayString}-${h}`}
                  className={`border-t border-l relative min-h-16 ${
                    blocked ? "bg-gray-100 cursor-not-allowed" : "hover:bg-blue-50/50 cursor-pointer"
                  } transition-colors`}
                  onClick={(e) => {
                    if (blocked || !permCreate) return;
                    openMenu(d, h, e);
                  }}
                >
                  <div className="absolute inset-0.5 overflow-auto space-y-0.5 text-[8px]">
                    {oportunidadesSlot.map((o, idx) => {
                      const tipo = getTipoCodigo(o.oportunidad_id);
                      const minutosRestantes = getMinutosRestantes(o.fecha_agenda, o.hora_agenda);
                      const colorTiempo = getColorEstadoTiempo(minutosRestantes, o.etapasconversion_id);

                      return (
                        <div
                          key={`${tipo}-${o.id}-${idx}`}
                          className="rounded shadow-sm border p-0.5 overflow-hidden cursor-pointer hover:shadow-md transition-shadow line-clamp-4"
                          style={getCardStyle(o)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuCell(null);
                            setSelectedOportunidad(o);
                            setDialogType(tipo);
                            setDialogDefaults({
                              fecha: o.fecha_agenda || "",
                              hora: o.hora_agenda || "",
                              oportunidadPadreId: o.oportunidad_padre_id || "",
                            });
                            setOpenOportunidadDialog(true);
                          }}
                        >
                          <div className="flex items-center justify-between gap-0.5">
                            <span className="font-semibold truncate flex-1">
                              {o.oportunidad_id}
                            </span>
                            <span className="text-[7px] font-bold uppercase px-0.5 rounded bg-black/10 flex-shrink-0">
                              {tipo === "ld" ? "LD" : "OP"}
                            </span>
                          </div>
                          <div className="truncate text-slate-700">
                            {o.cliente_name || ""}
                          </div>
                          {o.detalle && (
                            <div className="text-[7px] text-slate-600 line-clamp-1">
                              {o.detalle}
                            </div>
                          )}
                          {o.asignado_a_name && (
                            <div className="text-[7px] font-semibold text-blue-700 line-clamp-1">
                              👤 {o.asignado_a_name}
                            </div>
                          )}
                          {o.ultima_actividad_detalle && (
                            <div className="text-[7px] text-slate-500 italic line-clamp-1">
                              📝 {o.ultima_actividad_detalle}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {menuCell &&
                    menuCell.day === dayString &&
                    menuCell.hour === h &&
                    permCreate && (
                      <div
                        ref={menuRef}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute z-10 bg-white border rounded shadow-lg p-2 top-1 left-1 w-40"
                      >
                        <button
                          className="block w-full text-left hover:bg-blue-100 px-2 py-1 rounded text-xs font-medium transition-colors"
                          onClick={() => {
                            setSelectedOportunidad(null);
                            setDialogType("op");
                            setDialogDefaults({
                              fecha: dayString,
                              hora: h,
                              oportunidadPadreId: "",
                            });
                            setMenuCell(null);
                            setOpenOportunidadDialog(true);
                          }}
                        >
                          Nueva Oportunidad
                        </button>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}