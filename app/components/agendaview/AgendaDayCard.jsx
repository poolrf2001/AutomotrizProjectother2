"use client";

import { format } from "date-fns";

export default function AgendaDayCard({
  day,
  dayItems,
  permCreate,
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
  const dayString = format(day, "yyyy-MM-dd");

  return (
    <div
      key={dayString}
      className="border p-1 min-h-20 overflow-auto cursor-pointer hover:bg-blue-50 relative transition-colors"
      onClick={(e) => {
        if (!permCreate) return;
        openMenu(day, "10:00", e);
      }}
    >
      <div className="text-xs font-bold text-slate-900 mb-1">
        {format(day, "d")}
      </div>

      <div className="space-y-0.5 text-[8px]">
        {dayItems.slice(0, 3).map((o, idx) => {
          const tipo = getTipoCodigo(o.oportunidad_id);
          const minutosRestantes = getMinutosRestantes(o.fecha_agenda, o.hora_agenda);
          const colorTiempo = getColorEstadoTiempo(minutosRestantes, o.etapasconversion_id);

          return (
            <div
              key={`${tipo}-${o.id}-${idx}`}
              className="rounded p-0.5 truncate cursor-pointer hover:shadow-md transition-shadow line-clamp-3"
              style={{
                ...getCardStyle(o),
                borderLeft: `2px solid ${colorTiempo}`,
              }}
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
              <div className="font-semibold">{o.oportunidad_id}</div>
              {o.detalle && <div className="text-[7px] text-slate-600 line-clamp-1">{o.detalle}</div>}
              {o.asignado_a_name && <div className="text-[7px] font-semibold text-blue-700 line-clamp-1">👤 {o.asignado_a_name}</div>}
              {o.ultima_actividad_detalle && <div className="text-[7px] text-slate-500 italic line-clamp-1">📝 {o.ultima_actividad_detalle}</div>}
            </div>
          );
        })}

        {dayItems.length > 3 && (
          <div className="text-[7px] text-slate-500 px-0.5">
            +{dayItems.length - 3} más
          </div>
        )}
      </div>

      {menuCell && menuCell.day === dayString && permCreate && (
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute z-10 bg-white border rounded shadow-lg p-2 top-2 left-2 w-40"
        >
          <button
            className="block w-full text-left hover:bg-blue-100 px-2 py-1 rounded text-xs font-medium transition-colors"
            onClick={() => {
              setSelectedOportunidad(null);
              setDialogType("op");
              setDialogDefaults({
                fecha: dayString,
                hora: "10:00",
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
}