"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, HelpCircle } from "lucide-react";
import { toast } from "sonner";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useRequirePerm } from "@/hooks/useRequirePerm";
import { useAuth } from "@/context/AuthContext";
import { hasPermission } from "@/lib/permissions";

import OportunidadDialog from "@/app/components/oportunidades/OportunidadDialog";
import AssignmentDialogLead from "@/app/components/leads/AssignmentDialogLead";
import LeadsTable from "@/app/components/leads/LeadsTable";
import VistaPorUsuariosLeads from "@/app/components/leads/VistaPorUsuariosLeads";
import VistaPorEtapasLeads from "@/app/components/leads/VistaPorEtapasLeads";

const FILTER_ALL_CREATED = "__all_created__";
const FILTER_ALL_ASSIGNED = "__all_assigned__";
const FILTER_ALL_STATUS = "__all_status__";
const FILTER_ASSIGN_MODE_ALL = "__assign_mode_all__";
const FILTER_ASSIGN_MODE_ONLY_UNASSIGNED = "__assign_mode_only_unassigned__";
const FILTER_ASSIGN_MODE_ONLY_ASSIGNED = "__assign_mode_only_assigned__";

function buildUniqueOptions(rows, idKey, nameKey) {
  const map = new Map();

  rows.forEach((row) => {
    const id = row?.[idKey];
    const name = row?.[nameKey];
    if (id == null || !name) return;

    const key = String(id);
    if (!map.has(key)) {
      map.set(key, { id: key, name: String(name) });
    }
  });

  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "es", { sensitivity: "base" })
  );
}

function buildUniqueStatusOptions(rows) {
  const map = new Map();

  rows.forEach((row) => {
    const name = row?.etapa_name;
    if (!name) return;

    const key = String(name).trim();
    if (!key) return;

    if (!map.has(key)) {
      map.set(key, { id: key, name: key });
    }
  });

  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "es", { sensitivity: "base" })
  );
}

export default function LeadsPage() {
  const canView = useRequirePerm("leads", "view");

  const { user, permissions } = useAuth();

  const canCreate = hasPermission(permissions, "leads", "create");
  const canEdit = hasPermission(permissions, "leads", "edit");
  const canViewAll = hasPermission(permissions, "agenda", "viewall");
  const canAssign = hasPermission(permissions, "leads", "asignar");

  const [rows, setRows] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  const [createdByFilter, setCreatedByFilter] = useState(FILTER_ALL_CREATED);
  const [generalAssignedUserFilter, setGeneralAssignedUserFilter] = useState(
    FILTER_ALL_ASSIGNED
  );
  const [generalStatusFilter, setGeneralStatusFilter] = useState(FILTER_ALL_STATUS);
  const [generalAssignModeFilter, setGeneralAssignModeFilter] = useState(
    FILTER_ASSIGN_MODE_ALL
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);

  async function loadData() {
    try {
      setLoading(true);

      const [leadsRes, usersRes] = await Promise.all([
        fetch("/api/leads", { cache: "no-store" }),
        fetch("/api/usuarios", { cache: "no-store" }),
      ]);

      const [leadsData, usersData] = await Promise.all([
        leadsRes.json(),
        usersRes.json(),
      ]);

      if (!leadsRes.ok) {
        throw new Error(leadsData?.message || "No se pudo cargar leads");
      }

      if (!usersRes.ok) {
        throw new Error(usersData?.message || "No se pudo cargar usuarios");
      }

      setRows(Array.isArray(leadsData) ? leadsData : []);
      setUsuarios(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "No se pudo cargar información");
      setRows([]);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canView) loadData();
  }, [canView]);

  const visibleRows = useMemo(() => {
    if (!user?.id) return [];
    if (canViewAll) return rows;

    return rows.filter(
      (row) => String(row?.asignado_a ?? "") === String(user.id)
    );
  }, [rows, canViewAll, user]);

  const createdByOptions = useMemo(() => {
    return buildUniqueOptions(visibleRows, "created_by", "created_by_name");
  }, [visibleRows]);

  const assignedToOptions = useMemo(() => {
    return buildUniqueOptions(visibleRows, "asignado_a", "asignado_a_name");
  }, [visibleRows]);

  const statusOptions = useMemo(() => {
    return buildUniqueStatusOptions(visibleRows);
  }, [visibleRows]);

  const baseFilteredRows = useMemo(() => {
    return visibleRows.filter((row) => {
      const matchesCreatedBy =
        createdByFilter === FILTER_ALL_CREATED ||
        String(row?.created_by ?? "") === createdByFilter;

      return matchesCreatedBy;
    });
  }, [visibleRows, createdByFilter]);

  const generalRows = useMemo(() => {
    return baseFilteredRows.filter((row) => {
      const matchesAssignedUser =
        !canViewAll ||
        generalAssignedUserFilter === FILTER_ALL_ASSIGNED ||
        String(row?.asignado_a ?? "") === generalAssignedUserFilter;

      const matchesStatus =
        generalStatusFilter === FILTER_ALL_STATUS ||
        String(row?.etapa_name || "") === generalStatusFilter;

      const isAssigned =
        row?.asignado_a != null && String(row.asignado_a).trim() !== "";

      const matchesAssignMode =
        !canViewAll ||
        generalAssignModeFilter === FILTER_ASSIGN_MODE_ALL ||
        (generalAssignModeFilter === FILTER_ASSIGN_MODE_ONLY_UNASSIGNED &&
          !isAssigned) ||
        (generalAssignModeFilter === FILTER_ASSIGN_MODE_ONLY_ASSIGNED && isAssigned);

      return matchesAssignedUser && matchesStatus && matchesAssignMode;
    });
  }, [
    baseFilteredRows,
    canViewAll,
    generalAssignedUserFilter,
    generalStatusFilter,
    generalAssignModeFilter,
  ]);

  function handleOpenEdit(row) {
    setSelectedLead(row);
    setDialogOpen(true);
  }

  function handleOpenAssign(row) {
    setAssignTarget(row);
    setAssignDialogOpen(true);
  }

  function handleOpenFromViews(row) {
    setSelectedLead(row);
    setDialogOpen(true);
  }

  if (!canView) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="p-4 md:p-10 space-y-6">
        {/* HEADER */}
        <div className="border-b pb-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Leads</h1>
              <p className="text-gray-600 mt-1">
                Gestiona y organiza todos tus leads de manera eficiente
              </p>
            </div>

            {canCreate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      setSelectedLead(null);
                      setDialogOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="hidden sm:inline">Agregar Lead</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  Crear un nuevo lead
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* TABS */}
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full bg-gray-100 p-1 rounded-lg">
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger
                  value="general"
                  className="flex items-center gap-2 data-[state=active]:bg-white"
                >
                  <span>📋</span>
                  <span className="hidden sm:inline">General</span>
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Vista de tabla con filtros avanzados
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger
                  value="vista_usuarios"
                  className="flex items-center gap-2 data-[state=active]:bg-white"
                >
                  <span>👥</span>
                  <span className="hidden sm:inline">Tablero</span>
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Vista por usuarios asignados
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger
                  value="vista_etapas"
                  className="flex items-center gap-2 data-[state=active]:bg-white"
                >
                  <span>🎯</span>
                  <span className="hidden sm:inline">Kanban</span>
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Vista Kanban por etapas
              </TooltipContent>
            </Tooltip>
          </TabsList>

          {/* TAB: GENERAL */}
          <TabsContent value="general">
            <Card className="border-l-4 border-l-blue-500 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                <div className="space-y-4">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span>📊</span>
                    Vista General de Leads
                  </CardTitle>

                  {/* FILTROS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {canViewAll && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                              Usuario Asignado
                              <HelpCircle className="h-3 w-3 opacity-60" />
                            </label>
                            <Select
                              value={generalAssignedUserFilter}
                              onValueChange={setGeneralAssignedUserFilter}
                            >
                              <SelectTrigger className="bg-white hover:bg-gray-50">
                                <SelectValue placeholder="Usuario asignado" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={FILTER_ALL_ASSIGNED}>
                                  Todos los usuarios
                                </SelectItem>
                                {assignedToOptions.map((item) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {item.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          Filtra los leads por el usuario asignado
                        </TooltipContent>
                      </Tooltip>
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                            Estado
                            <HelpCircle className="h-3 w-3 opacity-60" />
                          </label>
                          <Select
                            value={generalStatusFilter}
                            onValueChange={setGeneralStatusFilter}
                          >
                            <SelectTrigger className="bg-white hover:bg-gray-50">
                              <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={FILTER_ALL_STATUS}>
                                Todos los estados
                              </SelectItem>
                              {statusOptions.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        Filtra los leads por su etapa actual
                      </TooltipContent>
                    </Tooltip>

                    {canViewAll && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                              Asignación
                              <HelpCircle className="h-3 w-3 opacity-60" />
                            </label>
                            <Select
                              value={generalAssignModeFilter}
                              onValueChange={setGeneralAssignModeFilter}
                            >
                              <SelectTrigger className="bg-white hover:bg-gray-50">
                                <SelectValue placeholder="Modo de asignación" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={FILTER_ASSIGN_MODE_ALL}>
                                  Todos
                                </SelectItem>
                                <SelectItem value={FILTER_ASSIGN_MODE_ONLY_ASSIGNED}>
                                  Solo asignados
                                </SelectItem>
                                <SelectItem value={FILTER_ASSIGN_MODE_ONLY_UNASSIGNED}>
                                  Solo sin asignar
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          Muestra solo leads asignados, sin asignar, o ambos
                        </TooltipContent>
                      </Tooltip>
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={loadData}
                          disabled={loading}
                          className="mt-6 gap-2 hover:bg-blue-50 border-blue-200"
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                          />
                          <span className="hidden sm:inline">Recargar</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        Actualizar datos de leads
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* INFO DE RESULTADOS */}
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-white rounded-lg px-3 py-2 border border-gray-200">
                    <span>📌</span>
                    <span>
                      Mostrando <span className="font-semibold">{generalRows.length}</span> de{" "}
                      <span className="font-semibold">{baseFilteredRows.length}</span> leads
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <LeadsTable
                  rows={generalRows}
                  loading={loading}
                  onEdit={handleOpenEdit}
                  onAssign={handleOpenAssign}
                  canEdit={canEdit}
                  canAssign={canAssign && canViewAll}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: VISTA USUARIOS */}
          <TabsContent value="vista_usuarios">
            <Card className="border-l-4 border-l-purple-500 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <span>👥</span>
                  Tablero por Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 overflow-hidden">
                <VistaPorUsuariosLeads
                  rows={baseFilteredRows}
                  usuarios={usuarios}
                  onOpenOportunidad={handleOpenFromViews}
                  canViewAll={canViewAll}
                  currentUserId={user?.id || null}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: VISTA ETAPAS */}
          <TabsContent value="vista_etapas">
            <Card className="border-l-4 border-l-green-500 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <span>🎯</span>
                  Kanban por Etapas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 overflow-hidden">
                <VistaPorEtapasLeads
                  rows={baseFilteredRows}
                  onOpenOportunidad={handleOpenFromViews}
                  canViewAll={canViewAll}
                  currentUserId={user?.id || null}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* INFO FOOTER */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">
                  Ayuda para gestionar leads
                </p>
                <ul className="space-y-1 text-xs">
                  <li>
                    • <span className="font-medium">Vista General:</span> Tabla
                    completa con filtros avanzados
                  </li>
                  <li>
                    • <span className="font-medium">Tablero:</span> Agrupa los
                    leads por usuario asignado
                  </li>
                  <li>
                    • <span className="font-medium">Kanban:</span> Organiza los
                    leads por etapa de venta
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <OportunidadDialog
        open={dialogOpen}
        onOpenChange={(value) => {
          setDialogOpen(value);
          if (!value) setSelectedLead(null);
        }}
        oportunidad={selectedLead}
        recordType="ld"
        onSuccess={() => {
          setDialogOpen(false);
          setSelectedLead(null);
          loadData();
        }}
      />

      <AssignmentDialogLead
        open={assignDialogOpen}
        onOpenChange={(value) => {
          setAssignDialogOpen(value);
          if (!value) setAssignTarget(null);
        }}
        oportunidad={assignTarget}
        usuarios={usuarios}
        onAssigned={() => {
          setAssignDialogOpen(false);
          setAssignTarget(null);
          loadData();
        }}
      />
    </TooltipProvider>
  );
}