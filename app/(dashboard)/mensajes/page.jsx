"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConversationWorkspace from "@/app/components/conversations/ConversationWorkspace";
import { useAuth } from "@/context/AuthContext";

export default function ConversationsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [metrics, setMetrics] = useState({
    total_conversations: 0,
    active_conversations: 0,
    unassigned_conversations: 0,
    overdue_conversations: 0,
    total_unread_messages: 0,
    my_active_conversations: 0,
    avg_first_response_seconds: null,
    max_wait_seconds: null,
    metrics_mode: "legacy",
  });
  const [selectedSession, setSelectedSession] = useState(null);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  async function load() {
    try {
      const [sessionsRes, metricsRes] = await Promise.all([
        fetch("/api/conversations/clients", { cache: "no-store" }),
        fetch(`/api/conversations/metrics?user_id=${user?.id || 0}`, { cache: "no-store" }),
      ]);

      const sessionsData = await sessionsRes.json();
      const metricsData = await metricsRes.json();

      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setMetrics((prev) => ({
        ...prev,
        ...(metricsData && typeof metricsData === "object" ? metricsData : {}),
      }));
    } catch (error) {
      console.error("Error cargando conversaciones:", error);
      setSessions([]);
    }
  }

  useEffect(() => {
    load();
  }, [user?.id]);

  function openTimeline(session) {
    setSelectedSession(session);
  }

  function resetQuickFilters() {
    setStatusFilter("all");
    setOwnerFilter("all");
    setAssignmentFilter("all");
    setPriorityFilter("all");
  }

  function applyMetricFilter(filterKey) {
    resetQuickFilters();

    if (filterKey === "active") {
      setAssignmentFilter("active");
      return;
    }

    if (filterKey === "unassigned") {
      setAssignmentFilter("unassigned");
      return;
    }

    if (filterKey === "overdue") {
      setPriorityFilter("overdue");
      return;
    }

    if (filterKey === "unread") {
      setStatusFilter("unread");
      return;
    }

    if (filterKey === "mine") {
      setOwnerFilter("mine");
      setAssignmentFilter("active");
    }
  }

  function severityClass(level) {
    if (level === "high") return "border-red-200 bg-red-50";
    if (level === "medium") return "border-amber-200 bg-amber-50";
    if (level === "low") return "border-emerald-200 bg-emerald-50";
    return "border bg-white";
  }

  function formatMinutes(seconds) {
    if (seconds == null) return "--";
    return `${Math.round(Number(seconds) / 60)}m`;
  }

  const metricsCards = useMemo(() => {
    const overdue = Number(metrics.overdue_conversations || 0);
    const unread = Number(metrics.total_unread_messages || 0);
    const maxWaitMinutes = metrics.max_wait_seconds == null
      ? null
      : Math.round(Number(metrics.max_wait_seconds) / 60);

    return [
      {
        key: "total",
        title: "Total",
        value: Number(metrics.total_conversations || 0),
        tone: "neutral",
      },
      {
        key: "active",
        title: "Activas",
        value: Number(metrics.active_conversations || 0),
        tone: Number(metrics.active_conversations || 0) > 0 ? "low" : "neutral",
        clickable: true,
      },
      {
        key: "unassigned",
        title: "Sin asignar",
        value: Number(metrics.unassigned_conversations || 0),
        tone: Number(metrics.unassigned_conversations || 0) >= 5
          ? "high"
          : Number(metrics.unassigned_conversations || 0) > 0
            ? "medium"
            : "low",
        clickable: true,
      },
      {
        key: "overdue",
        title: "SLA vencidas",
        value: overdue,
        tone: overdue >= 3 ? "high" : overdue > 0 ? "medium" : "low",
        clickable: true,
      },
      {
        key: "unread",
        title: "No leídos",
        value: unread,
        tone: unread >= 20 ? "high" : unread > 0 ? "medium" : "low",
        clickable: true,
      },
      {
        key: "mine",
        title: "Mis activas",
        value: Number(metrics.my_active_conversations || 0),
        tone: Number(metrics.my_active_conversations || 0) >= 8
          ? "medium"
          : Number(metrics.my_active_conversations || 0) > 0
            ? "low"
            : "neutral",
        clickable: true,
      },
      {
        key: "ftr",
        title: "1ra resp. prom.",
        value: formatMinutes(metrics.avg_first_response_seconds),
        tone: metrics.avg_first_response_seconds == null
          ? "neutral"
          : Number(metrics.avg_first_response_seconds) > 900
            ? "high"
            : Number(metrics.avg_first_response_seconds) > 300
              ? "medium"
              : "low",
      },
      {
        key: "wait",
        title: "Espera máxima",
        value: maxWaitMinutes == null ? "--" : `${maxWaitMinutes}m`,
        tone: maxWaitMinutes == null
          ? "neutral"
          : maxWaitMinutes > 60
            ? "high"
            : maxWaitMinutes > 20
              ? "medium"
              : "low",
      },
    ];
  }, [metrics]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const term = search.trim().toLowerCase();
      const bySearch = !term
        || String(s?.cliente_nombre || "").toLowerCase().includes(term)
        || String(s?.celular || "").toLowerCase().includes(term)
        || String(s?.ultimomensaje || "").toLowerCase().includes(term);

      const sourceChannel = String(s?.source_channel || "").toLowerCase();
      const byChannel = channelFilter === "all" || sourceChannel === channelFilter;

      const messageStatus = String(s?.message_status || "").toLowerCase();
      const unreadCount = Number(s?.unread_count || 0);
      const byStatus = statusFilter === "all"
        || messageStatus === statusFilter
        || (statusFilter === "unread" && unreadCount > 0);

      const assignedAgentId = Number(s?.assigned_agent_id || 0);
      const currentUserId = Number(user?.id || 0);
      const byOwner = ownerFilter === "all"
        || (ownerFilter === "mine" && currentUserId > 0 && assignedAgentId === currentUserId)
        || (ownerFilter === "unassigned" && !assignedAgentId);

      const assignmentStatus = String(s?.assignment_status || "unassigned").toLowerCase();
      const byAssignment = assignmentFilter === "all"
        || (assignmentFilter === "active" && (assignmentStatus === "open" || assignmentStatus === "pending"))
        || assignmentStatus === assignmentFilter;

      const priorityLevel = String(s?.priority_level || "normal").toLowerCase();
      const byPriority = priorityFilter === "all"
        || (priorityFilter === "overdue" && Number(s?.is_overdue || 0) === 1)
        || priorityLevel === priorityFilter;

      return bySearch && byChannel && byStatus && byOwner && byAssignment && byPriority;
    });
  }, [sessions, search, channelFilter, statusFilter, ownerFilter, assignmentFilter, priorityFilter, user]);

  return (
    <div className="h-full min-h-0 flex flex-col gap-3">

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2">
        {metricsCards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => card.clickable && applyMetricFilter(card.key)}
            className={`rounded-lg p-3 text-left transition ${severityClass(card.tone)} ${card.clickable ? "hover:shadow-sm cursor-pointer" : "cursor-default"}`}
          >
            <p className="text-xs text-gray-600">{card.title}</p>
            <p className="text-lg font-semibold">{card.value}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cliente, celular o mensaje"
          className="sm:col-span-3"
        />

        <select
          className="h-9 rounded-md border bg-transparent px-3 text-sm"
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
        >
          <option value="all">Todos los canales</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="instagram">Instagram</option>
          <option value="messenger">Messenger</option>
          <option value="n8n">n8n</option>
        </select>

        <select
          className="h-9 rounded-md border bg-transparent px-3 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="received">Recibido</option>
          <option value="queued">En cola</option>
          <option value="sent">Enviado</option>
          <option value="delivered">Entregado</option>
          <option value="read">Leido</option>
          <option value="failed">Fallido</option>
          <option value="unread">No leidos</option>
        </select>

        <select
          className="h-9 rounded-md border bg-transparent px-3 text-sm"
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
        >
          <option value="all">Todas</option>
          <option value="mine">Mis conversaciones</option>
          <option value="unassigned">Sin asignar</option>
        </select>

        <select
          className="h-9 rounded-md border bg-transparent px-3 text-sm"
          value={assignmentFilter}
          onChange={(e) => setAssignmentFilter(e.target.value)}
        >
          <option value="all">Todos los flujos</option>
          <option value="active">Abiertas/Pendientes</option>
          <option value="open">Abiertas</option>
          <option value="pending">Pendientes</option>
          <option value="closed">Cerradas</option>
          <option value="unassigned">Sin asignar</option>
        </select>

        <select
          className="h-9 rounded-md border bg-transparent px-3 text-sm"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all">Todas las prioridades</option>
          <option value="urgent">Urgente</option>
          <option value="high">Alta</option>
          <option value="normal">Normal</option>
          <option value="low">Baja</option>
          <option value="overdue">Vencidas SLA</option>
        </select>

        <div className="flex items-center text-xs text-gray-500 px-1">
          {filteredSessions.length} conversaciones
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-3 flex-1 min-h-0">
        <div className={`${selectedSession ? "hidden lg:flex" : "flex"} border rounded-xl overflow-hidden bg-white shadow min-h-0 h-full flex-col`}>
          <div className="overflow-y-auto flex-1 min-h-0">
            {filteredSessions.map((s) => (
              <div
                key={s.session_id}
                className={`flex items-center justify-between p-4 border-b hover:bg-gray-50 ${selectedSession?.session_id === s.session_id ? "bg-gray-50" : ""}`}
              >
                <div>
                  <div className="font-semibold">
                    {s.cliente_nombre || "Cliente"}
                  </div>

                  <div className="text-sm text-gray-500 truncate max-w-55">
                    {s.ultimomensaje || "Sin mensajes"}
                  </div>

                  <div className="text-xs text-gray-400">
                    {s.celular || s.phone}
                    {s.source_channel ? ` · ${s.source_channel}` : ""}
                    {s.message_status ? ` · ${s.message_status}` : ""}
                  </div>

                  <div className="text-xs mt-1 text-gray-500">
                    {s.assigned_agent_name
                      ? `Asignado a: ${s.assigned_agent_name}`
                      : "Sin asignar"}
                    {s.assignment_status ? ` · ${s.assignment_status}` : ""}
                  </div>

                  <div className="text-xs mt-1 text-gray-500">
                    Prioridad: {s.priority_level || "normal"}
                    {s.sla_due_at ? ` · SLA: ${new Date(s.sla_due_at).toLocaleString()}` : ""}
                    {Number(s?.is_overdue || 0) === 1 ? " · Vencida" : ""}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {Number(s?.is_overdue || 0) === 1 && (
                    <span className="h-6 px-2 rounded-full bg-amber-600 text-white text-xs inline-flex items-center justify-center">
                      SLA
                    </span>
                  )}

                  {Number(s?.unread_count || 0) > 0 && (
                    <span className="min-w-6 h-6 px-2 rounded-full bg-red-600 text-white text-xs inline-flex items-center justify-center">
                      {s.unread_count}
                    </span>
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openTimeline(s)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredSessions.length === 0 && (
              <div className="p-6 text-sm text-gray-500 text-center">
                No hay conversaciones que coincidan con los filtros.
              </div>
            )}
            </div>
          </div>

        <div className={`${selectedSession ? "block" : "hidden lg:block"} min-h-0 h-full`}>
          <ConversationWorkspace
            session={selectedSession}
            onConversationUpdated={load}
            onBack={() => setSelectedSession(null)}
          />
        </div>
      </div>

    </div>
  );
}
