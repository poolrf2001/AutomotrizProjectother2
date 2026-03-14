"use client";

import { useRequirePerm } from "@/hooks/useRequirePerm";
import CotizacionForm from "@/app/components/cotizaciones/CotizacionForm";

export default function NuevaCotizacionGeneralPage() {
  useRequirePerm("cotizacion", "create");

  return (
    <div className="p-6">
      <CotizacionForm tipo="taller" backUrl="/cotizacion" showTipoSelector />
    </div>
  );
}
