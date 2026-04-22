"use client";

import OportunidadDialog from "@/app/components/oportunidades/OportunidadDialog";

export default function AgendaDialogs({
  openOportunidadDialog,
  setOpenOportunidadDialog,
  dialogDefaults,
  selectedOportunidad,
  dialogType,
  setSelectedOportunidad,
  setDialogDefaults,
  loadOportunidades,
}) {
  return (
    <OportunidadDialog
      open={openOportunidadDialog}
      onOpenChange={setOpenOportunidadDialog}
      defaultFecha={dialogDefaults.fecha}
      defaultHora={dialogDefaults.hora}
      oportunidadPadreId={dialogDefaults.oportunidadPadreId}
      oportunidad={selectedOportunidad}
      recordType={dialogType}
      onSuccess={() => {
        setOpenOportunidadDialog(false);
        setSelectedOportunidad(null);
        setDialogDefaults({
          fecha: "",
          hora: "",
          oportunidadPadreId: "",
        });
        loadOportunidades();
      }}
    />
  );
}