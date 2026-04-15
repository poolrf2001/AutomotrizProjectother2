"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Zap } from "lucide-react";

export default function DashboardStatsCards({
  canViewOportunidades,
  canViewLeads,
  stats,
}) {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
        {canViewOportunidades && (
          <Card
            className="overflow-hidden hover:shadow-lg transition-shadow"
            style={{ borderLeftWidth: "3px", borderLeftColor: "#5d16ec" }}
          >
            <CardContent className="p-2 sm:p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 truncate">
                    OPO Totales
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#5d16ec]">
                    {stats.totalOportunidades}
                  </p>
                </div>
                <TrendingUp
                  size={20}
                  className="flex-shrink-0 opacity-20 text-[#5d16ec]"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {canViewLeads && (
          <Card
            className="overflow-hidden hover:shadow-lg transition-shadow"
            style={{ borderLeftWidth: "3px", borderLeftColor: "#ff6b6b" }}
          >
            <CardContent className="p-2 sm:p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 truncate">
                    Leads Totales
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#ff6b6b]">
                    {stats.totalLeads}
                  </p>
                </div>
                <Zap
                  size={20}
                  className="flex-shrink-0 opacity-20 text-[#ff6b6b]"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {stats.etapas?.map((etapa) => {
          const totalEtapa =
            (stats.oposPorEtapa?.[etapa.id] || 0) +
            (stats.leadsPorEtapa?.[etapa.id] || 0);

          return (
            <Card
              key={etapa.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
              style={{ borderLeftWidth: "3px", borderLeftColor: "#4ecdc4" }}
            >
              <CardContent className="p-2 sm:p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 truncate">
                      {etapa.nombre}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-[#4ecdc4]">
                      {totalEtapa}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      OPO: {stats.oposPorEtapa?.[etapa.id] || 0} | LD:{" "}
                      {stats.leadsPorEtapa?.[etapa.id] || 0}
                    </p>
                  </div>
                  <TrendingUp
                    size={16}
                    className="flex-shrink-0 opacity-20 text-[#4ecdc4]"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}