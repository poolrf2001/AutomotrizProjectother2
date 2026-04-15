"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function DashboardInfoCard() {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="pt-3">
        <div className="flex gap-2">
          <div className="text-2xl">ℹ️</div>
          <div className="text-xs space-y-1">
            <p className="font-semibold text-blue-900">Dashboard Info</p>
            <ul className="text-blue-700 space-y-0.5">
              <li>• Tarjetas Totales: OPO y Leads por separado</li>
              <li>• Tarjetas Por Etapa: Suma de OPO + Leads con desglose</li>
              <li>• Tabla Agenda: Filtra por fecha_agenda (Hoy, Semana, Mes)</li>
              <li>• Tablas OPO y Leads: Filtros independientes</li>
              <li>• 15 registros por página con paginación</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}