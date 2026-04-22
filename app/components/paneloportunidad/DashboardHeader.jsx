"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BRAND_PRIMARY = "#5d16ec";
const BRAND_SECONDARY = "#81929c";

export default function DashboardHeader({ loading, onRefresh, canViewAll }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: BRAND_PRIMARY }}>
          Panel de Ventas
        </h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: BRAND_SECONDARY }}>
          {canViewAll ? "Vista completa" : "Solo tus asignaciones"}
        </p>
      </div>

      <div className="flex gap-2 w-full sm:w-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onRefresh}
              disabled={loading}
              variant="outline"
              size="sm"
              className="gap-2 text-xs sm:text-sm h-8 sm:h-9"
            >
              <RefreshCw
                className={`h-3 sm:h-4 w-3 sm:w-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Recargar
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}