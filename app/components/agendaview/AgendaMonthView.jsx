"use client";

import { format } from "date-fns";
import AgendaDayCard from "./AgendaDayCard";

export default function AgendaMonthView({
  days,
  filteredOportunidades,
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
  const weeksInMonth = [];
  let currentWeek = [];

  const firstDayOfMonth = days[0];
  const startDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;

  for (let i = 0; i < startDay; i++) currentWeek.push(null);

  days.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeksInMonth.push([...currentWeek]);
      currentWeek = [];
    }
  });

  while (currentWeek.length < 7) currentWeek.push(null);
  if (currentWeek.length > 0) weeksInMonth.push(currentWeek);

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm flex flex-col h-full">
      <div className="grid grid-cols-7 bg-gradient-to-r from-slate-50 to-slate-100 flex-shrink-0">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
          <div key={day} className="p-2 text-center font-semibold text-slate-700 border-b text-xs">
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {weeksInMonth.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7">
            {week.map((day, dayIdx) => {
              if (!day) {
                return <div key={`empty-${dayIdx}`} className="border p-1 bg-gray-50 min-h-20" />;
              }

              const dayString = format(day, "yyyy-MM-dd");
              const dayItems = filteredOportunidades.filter(
                (o) => String(o.fecha_agenda || "").trim().slice(0, 10) === dayString
              );

              return (
                <AgendaDayCard
                  key={dayString}
                  day={day}
                  dayItems={dayItems}
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
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}