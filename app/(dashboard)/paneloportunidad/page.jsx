"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { hasPermission } from "@/lib/permissions";

import DashboardHeader from "@/app/components/paneloportunidad/DashboardHeader";
import DashboardStatsCards from "@/app/components/paneloportunidad/DashboardStatsCards";
import DashboardAgendaTable from "@/app/components/paneloportunidad/DashboardAgendaTable";
import DashboardInfoCard from "@/app/components/paneloportunidad/DashboardInfoCard";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar, Eye, Edit2, ChevronLeft, ChevronRight } from "lucide-react";

const FILTER_ALL = "all";
const FILTER_TODAY = "hoy";
const FILTER_THIS_WEEK = "esta_semana";
const FILTER_THIS_MONTH = "este_mes";
const ITEMS_PER_PAGE = 15;
const BRAND_PRIMARY = "#5d16ec";
const BRAND_SECONDARY = "#81929c";

export default function DashboardPage() {
  const router = useRouter();
  const { user, permissions } = useAuth();

  const canViewOportunidades =
    hasPermission(permissions, "oportunidades", "view") ||
    hasPermission(permissions, "oportunidades", "viewall");
  const canViewLeads =
    hasPermission(permissions, "leads", "view") ||
    hasPermission(permissions, "leads", "viewall");

  const canViewAllOportunidades = hasPermission(
    permissions,
    "oportunidades",
    "viewall"
  );
  const canViewAllLeads = hasPermission(permissions, "leads", "viewall");
  const canEdit = hasPermission(permissions, "oportunidades", "edit");

  const [stats, setStats] = useState({
    totalOportunidades: 0,
    totalLeads: 0,
    oposPorEtapa: {},
    leadsPorEtapa: {},
    etapas: [],
  });

  const [loading, setLoading] = useState(false);
  const [filterAgendaPeriodo, setFilterAgendaPeriodo] = useState(FILTER_TODAY);
  const [filterOposPeriodo, setFilterOposPeriodo] = useState(FILTER_ALL);
  const [filterLeadsPeriodo, setFilterLeadsPeriodo] = useState(FILTER_ALL);

  const [rawData, setRawData] = useState({
    oportunidades: [],
    leads: [],
    usuarios: [],
    etapas: [],
    detallesOpo: {},
    detallesLeads: {},
  });

  const [pagOportunidades, setPagOportunidades] = useState(0);
  const [pagLeads, setPagLeads] = useState(0);
  const [pagAgenda, setPagAgenda] = useState(0);

  function getFechaFiltros() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);

    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    finMes.setHours(23, 59, 59, 999);

    return {
      hoy,
      finHoy: new Date(hoy.getTime() + 24 * 60 * 60 * 1000),
      inicioSemana,
      finSemana,
      inicioMes,
      finMes,
    };
  }

  function filterByAgendaPeriodo(items, detalles, periodo) {
    const fechas = getFechaFiltros();

    return items.filter((item) => {
      const detalle = detalles[item.id];
      if (!detalle || !detalle.fecha_agenda) return false;

      const agendaDate = new Date(detalle.fecha_agenda);

      switch (periodo) {
        case FILTER_TODAY:
          return agendaDate >= fechas.hoy && agendaDate < fechas.finHoy;
        case FILTER_THIS_WEEK:
          return agendaDate >= fechas.inicioSemana && agendaDate <= fechas.finSemana;
        case FILTER_THIS_MONTH:
          return agendaDate >= fechas.inicioMes && agendaDate <= fechas.finMes;
        default:
          return true;
      }
    });
  }

  async function enriquecerConDetalles(items, apiEndpoint, type) {
    const detalles = {};

    await Promise.allSettled(
      items.map(async (item) => {
        try {
          const res = await fetch(`${apiEndpoint}/${item.id}/detalles?limit=1`, {
            cache: "no-store",
          });

          if (!res.ok) return;

          const data = await res.json();
          const ultimoDetalle = Array.isArray(data)
            ? data[0]
            : Array.isArray(data?.data)
            ? data.data[0]
            : null;

          if (ultimoDetalle) detalles[item.id] = ultimoDetalle;
        } catch (error) {
          console.warn(`Error enriqueciendo ${type} ${item.id}:`, error);
        }
      })
    );

    return detalles;
  }

  async function loadData() {
    try {
      setLoading(true);

      const [opRes, leadsRes, usersRes, etapasRes] = await Promise.all([
        fetch("/api/oportunidades-oportunidades?limit=1000", { cache: "no-store" }),
        fetch("/api/leads?limit=1000", { cache: "no-store" }),
        fetch("/api/usuarios", { cache: "no-store" }),
        fetch("/api/etapasconversion", { cache: "no-store" }),
      ]);

      const opData = await opRes.json();
      const leadsData = await leadsRes.json();
      const usersData = await usersRes.json();
      const etapasData = await etapasRes.json();

      let oportunidades = Array.isArray(opData) ? opData : opData?.data || [];
      let leads = leadsData?.data || [];
      const usuarios = Array.isArray(usersData) ? usersData : [];
      const etapas = Array.isArray(etapasData) ? etapasData : [];

      oportunidades = oportunidades.filter(
        (opp) => opp.oportunidad_id?.substring(0, 3) === "OPO"
      );

      const detallesOpo = await enriquecerConDetalles(
        oportunidades,
        "/api/oportunidades-oportunidades",
        "oportunidad"
      );
      const detallesLeads = await enriquecerConDetalles(
        leads,
        "/api/leads",
        "lead"
      );

      setRawData({
        oportunidades,
        leads,
        usuarios,
        etapas,
        detallesOpo,
        detallesLeads,
      });

      const opoVisibles = canViewAllOportunidades
        ? oportunidades
        : oportunidades.filter(
            (opp) =>
              String(opp.asignado_a) === String(user?.id) ||
              String(opp.created_by) === String(user?.id)
          );

      const leadsVisibles = canViewAllLeads
        ? leads
        : leads.filter(
            (lead) =>
              String(lead.asignado_a) === String(user?.id) ||
              String(lead.created_by) === String(user?.id)
          );

      const oposPorEtapa = {};
      const leadsPorEtapa = {};

      etapas.forEach((etapa) => {
        const opoCount = opoVisibles.filter(
          (opp) => opp.etapasconversion_id === etapa.id
        ).length;
        const leadCount = leadsVisibles.filter(
          (lead) => lead.etapasconversion_id === etapa.id
        ).length;

        oposPorEtapa[etapa.id] = opoCount;
        leadsPorEtapa[etapa.id] = leadCount;
      });

      setStats({
        totalOportunidades: opoVisibles.length,
        totalLeads: leadsVisibles.length,
        oposPorEtapa,
        leadsPorEtapa,
        etapas,
      });

      toast.success("Dashboard actualizado");
    } catch (error) {
      console.error("❌ Error cargando dashboard:", error);
      toast.error("Error cargando datos del dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canViewOportunidades || canViewLeads) loadData();
  }, [canViewOportunidades, canViewLeads]);

  const agendaHoy = useMemo(() => {
    let opoConAgenda = rawData.oportunidades.filter(
      (opp) => rawData.detallesOpo[opp.id] && rawData.detallesOpo[opp.id].fecha_agenda
    );
    let leadsConAgenda = rawData.leads.filter(
      (lead) => rawData.detallesLeads[lead.id] && rawData.detallesLeads[lead.id].fecha_agenda
    );

    opoConAgenda = filterByAgendaPeriodo(
      opoConAgenda,
      rawData.detallesOpo,
      filterAgendaPeriodo
    );
    leadsConAgenda = filterByAgendaPeriodo(
      leadsConAgenda,
      rawData.detallesLeads,
      filterAgendaPeriodo
    );

    const opoVisibles = canViewAllOportunidades
      ? opoConAgenda
      : opoConAgenda.filter(
          (opp) =>
            String(opp.asignado_a) === String(user?.id) ||
            String(opp.created_by) === String(user?.id)
        );

    const leadsVisibles = canViewAllLeads
      ? leadsConAgenda
      : leadsConAgenda.filter(
          (lead) =>
            String(lead.asignado_a) === String(user?.id) ||
            String(lead.created_by) === String(user?.id)
        );

    return [
      ...opoVisibles.map((opp) => ({
        ...opp,
        tipo: "OPO",
        detalle: rawData.detallesOpo[opp.id],
      })),
      ...leadsVisibles.map((lead) => ({
        ...lead,
        tipo: "LD",
        detalle: rawData.detallesLeads[lead.id],
      })),
    ].sort((a, b) => new Date(a.detalle.fecha_agenda) - new Date(b.detalle.fecha_agenda));
  }, [rawData, filterAgendaPeriodo, canViewAllOportunidades, canViewAllLeads, user]);

  const oportunidadesOrdenadas = useMemo(() => {
    let opoVisibles = canViewAllOportunidades
      ? rawData.oportunidades
      : rawData.oportunidades.filter(
          (opp) =>
            String(opp.asignado_a) === String(user?.id) ||
            String(opp.created_by) === String(user?.id)
        );

    opoVisibles = filterByAgendaPeriodo(
      opoVisibles,
      rawData.detallesOpo,
      filterOposPeriodo
    );

    return opoVisibles.sort((a, b) => {
      const fechaA = rawData.detallesOpo[a.id]?.fecha_agenda
        ? new Date(rawData.detallesOpo[a.id].fecha_agenda)
        : new Date(0);
      const fechaB = rawData.detallesOpo[b.id]?.fecha_agenda
        ? new Date(rawData.detallesOpo[b.id].fecha_agenda)
        : new Date(0);
      return fechaB - fechaA;
    });
  }, [rawData, canViewAllOportunidades, user, filterOposPeriodo]);

  const leadsOrdenados = useMemo(() => {
    let leadsVisibles = canViewAllLeads
      ? rawData.leads
      : rawData.leads.filter(
          (lead) =>
            String(lead.asignado_a) === String(user?.id) ||
            String(lead.created_by) === String(user?.id)
        );

    leadsVisibles = filterByAgendaPeriodo(
      leadsVisibles,
      rawData.detallesLeads,
      filterLeadsPeriodo
    );

    return leadsVisibles.sort((a, b) => {
      const fechaA = rawData.detallesLeads[a.id]?.fecha_agenda
        ? new Date(rawData.detallesLeads[a.id].fecha_agenda)
        : new Date(0);
      const fechaB = rawData.detallesLeads[b.id]?.fecha_agenda
        ? new Date(rawData.detallesLeads[b.id].fecha_agenda)
        : new Date(0);
      return fechaB - fechaA;
    });
  }, [rawData, canViewAllLeads, user, filterLeadsPeriodo]);

  const agendaPaginada = useMemo(() => {
    const inicio = pagAgenda * ITEMS_PER_PAGE;
    return agendaHoy.slice(inicio, inicio + ITEMS_PER_PAGE);
  }, [agendaHoy, pagAgenda]);

  const opoPaginada = useMemo(() => {
    const inicio = pagOportunidades * ITEMS_PER_PAGE;
    return oportunidadesOrdenadas.slice(inicio, inicio + ITEMS_PER_PAGE);
  }, [oportunidadesOrdenadas, pagOportunidades]);

  const leadsPaginada = useMemo(() => {
    const inicio = pagLeads * ITEMS_PER_PAGE;
    return leadsOrdenados.slice(inicio, inicio + ITEMS_PER_PAGE);
  }, [leadsOrdenados, pagLeads]);

  const totalPagAgenda = Math.ceil(agendaHoy.length / ITEMS_PER_PAGE);
  const totalPagOpo = Math.ceil(oportunidadesOrdenadas.length / ITEMS_PER_PAGE);
  const totalPagLeads = Math.ceil(leadsOrdenados.length / ITEMS_PER_PAGE);

  if (!canViewOportunidades && !canViewLeads) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-[#81929c]">
          No tienes permiso para acceder al dashboard
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-3 sm:p-6 space-y-4 max-w-7xl mx-auto">
        <DashboardHeader
          loading={loading}
          onRefresh={loadData}
          canViewAll={canViewAllOportunidades || canViewAllLeads}
        />

        <DashboardStatsCards
          canViewOportunidades={canViewOportunidades}
          canViewLeads={canViewLeads}
          stats={stats}
        />

        <DashboardAgendaTable
          agendaHoy={agendaHoy}
          agendaPaginada={agendaPaginada}
          totalPagAgenda={totalPagAgenda}
          pagAgenda={pagAgenda}
          setPagAgenda={setPagAgenda}
          filterAgendaPeriodo={filterAgendaPeriodo}
          setFilterAgendaPeriodo={setFilterAgendaPeriodo}
          FILTER_TODAY={FILTER_TODAY}
          FILTER_THIS_WEEK={FILTER_THIS_WEEK}
          FILTER_THIS_MONTH={FILTER_THIS_MONTH}
          router={router}
          rawData={rawData}
          canEdit={canEdit}
        />

        {/* OPORTUNIDADES */}
        {canViewOportunidades && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm" style={{ color: BRAND_PRIMARY }}>
                    Oportunidades - {oportunidadesOrdenadas.length} registros
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  {/* filtro */}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {opoPaginada.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-500">
                  No hay oportunidades para este período
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs px-3 py-2">Código</TableHead>
                      <TableHead className="text-xs px-3 py-2">Cliente</TableHead>
                      <TableHead className="text-xs px-3 py-2">Asignado</TableHead>
                      <TableHead className="text-xs px-3 py-2">Etapa</TableHead>
                      <TableHead className="text-xs px-3 py-2">Fecha Agenda</TableHead>
                      <TableHead className="text-xs text-right px-3 py-2">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opoPaginada.map((item) => {
                      const usuario = rawData.usuarios.find((u) => u.id === item.asignado_a);
                      const etapa = rawData.etapas.find((e) => e.id === item.etapasconversion_id);
                      const detalle = rawData.detallesOpo[item.id];
                      const fecha = detalle?.fecha_agenda
                        ? new Date(detalle.fecha_agenda).toLocaleDateString()
                        : "-";

                      return (
                        <TableRow key={item.id} className="hover:bg-gray-50">
                          <TableCell className="text-xs px-3 py-2 font-medium">
                            {item.oportunidad_id || `OPO-${item.id}`}
                          </TableCell>
                          <TableCell className="text-xs px-3 py-2 max-w-xs truncate">
                            {item?.cliente_nombre || "-"}
                          </TableCell>
                          <TableCell className="text-xs px-3 py-2">
                            {usuario?.fullname || "Sin asignar"}
                          </TableCell>
                          <TableCell className="text-xs px-3 py-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {etapa?.nombre || "Sin etapa"}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs px-3 py-2">{fecha}</TableCell>
                          <TableCell className="px-3 py-2 text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => router.push(`/oportunidades/${item.id}`)}
                              >
                                <Eye size={12} />
                              </Button>
                              {canEdit && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => router.push(`/oportunidades/${item.id}`)}
                                >
                                  <Edit2 size={12} />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* LEADS */}
        {canViewLeads && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm" style={{ color: BRAND_PRIMARY }}>
                    Leads - {leadsOrdenados.length} registros
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {leadsPaginada.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-500">
                  No hay leads para este período
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs px-3 py-2">Código</TableHead>
                      <TableHead className="text-xs px-3 py-2">Cliente</TableHead>
                      <TableHead className="text-xs px-3 py-2">Asignado</TableHead>
                      <TableHead className="text-xs px-3 py-2">Etapa</TableHead>
                      <TableHead className="text-xs px-3 py-2">Fecha Agenda</TableHead>
                      <TableHead className="text-xs text-right px-3 py-2">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leadsPaginada.map((item) => {
                      const usuario = rawData.usuarios.find((u) => u.id === item.asignado_a);
                      const etapa = rawData.etapas.find((e) => e.id === item.etapasconversion_id);
                      const detalle = rawData.detallesLeads[item.id];
                      const fecha = detalle?.fecha_agenda
                        ? new Date(detalle.fecha_agenda).toLocaleDateString()
                        : "-";

                      return (
                        <TableRow key={item.id} className="hover:bg-gray-50">
                          <TableCell className="text-xs px-3 py-2 font-medium">
                            {item.oportunidad_id || `LD-${item.id}`}
                          </TableCell>
                          <TableCell className="text-xs px-3 py-2 max-w-xs truncate">
                            {item?.cliente_nombre || "-"}
                          </TableCell>
                          <TableCell className="text-xs px-3 py-2">
                            {usuario?.fullname || "Sin asignar"}
                          </TableCell>
                          <TableCell className="text-xs px-3 py-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {etapa?.nombre || "Sin etapa"}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs px-3 py-2">{fecha}</TableCell>
                          <TableCell className="px-3 py-2 text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => router.push(`/oportunidades/${item.id}`)}
                              >
                                <Eye size={12} />
                              </Button>
                              {canEdit && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => router.push(`/oportunidades/${item.id}`)}
                                >
                                  <Edit2 size={12} />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        <DashboardInfoCard />
      </div>
    </TooltipProvider>
  );
}