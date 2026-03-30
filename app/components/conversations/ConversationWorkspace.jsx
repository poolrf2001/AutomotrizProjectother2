"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  FileText,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";

export default function ConversationWorkspace({
  session,
  onConversationUpdated,
  onBack,
  focusComposerSignal = 0,
}) {
  const { user } = useAuth();

  // ── Mensajes / timeline ──────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);
  const composerRef = useRef(null);
  const lastMarkedRef = useRef(0);
  const stickToBottomRef = useRef(true);

  // ── Gestión de sesión ────────────────────────────────────────
  const [agents, setAgents] = useState([]);
  const [assignedAgentId, setAssignedAgentId] = useState("");
  const [assignmentStatus, setAssignmentStatus] = useState("unassigned");
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");
  const [priorityLevel, setPriorityLevel] = useState("normal");
  const [slaDueAt, setSlaDueAt] = useState("");
  const [savingPriority, setSavingPriority] = useState(false);
  const [priorityError, setPriorityError] = useState("");
  const [auditItems, setAuditItems] = useState([]);

  // ─────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────

  function toDatetimeLocalValue(dateLike) {
    if (!dateLike) return "";
    const date = new Date(dateLike);
    if (Number.isNaN(date.getTime())) return "";
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  }

  // ─────────────────────────────────────────────────────────────
  // Gestión de sesión
  // ─────────────────────────────────────────────────────────────

  async function loadAgents() {
    try {
      const res = await fetch("/api/usuarios", { cache: "no-store" });
      const data = await res.json();
      const parsed = Array.isArray(data) ? data : [];
      setAgents(parsed.filter((u) => Number(u?.is_active) === 1 || u?.is_active === true));
    } catch (e) {
      console.error("Error cargando asesores:", e);
      setAgents([]);
    }
  }

  async function saveAssignment(nextAssignedAgentId, nextStatus) {
    if (!session?.session_id || savingAssignment) return;

    setSavingAssignment(true);
    setAssignmentError("");

    try {
      const payload = {
        session_id: session.session_id,
        assigned_agent_id: nextAssignedAgentId ? Number(nextAssignedAgentId) : null,
        assignment_status: nextStatus,
      };

      const res = await fetch("/api/conversations/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "No se pudo actualizar la asignación");
      }

      if (onConversationUpdated) onConversationUpdated();
      loadAudit();
    } catch (e) {
      setAssignmentError(e?.message || "Error actualizando asignación");
    } finally {
      setSavingAssignment(false);
    }
  }

  async function savePriority(nextPriority, nextSlaDueAt) {
    if (!session?.session_id || savingPriority) return;

    setSavingPriority(true);
    setPriorityError("");

    try {
      const payload = {
        session_id: session.session_id,
        priority_level: nextPriority,
        sla_due_at: nextSlaDueAt
          ? new Date(nextSlaDueAt).toISOString().slice(0, 19).replace("T", " ")
          : null,
      };

      const res = await fetch("/api/conversations/priority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "No se pudo actualizar prioridad/SLA");
      }

      if (onConversationUpdated) onConversationUpdated();
      loadAudit();
    } catch (e) {
      setPriorityError(e?.message || "Error actualizando prioridad/SLA");
    } finally {
      setSavingPriority(false);
    }
  }

  async function markAsRead(lastMessageId) {
    if (!session?.session_id || !lastMessageId) return;
    if (lastMarkedRef.current >= lastMessageId) return;

    try {
      await fetch("/api/conversations/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.session_id,
          last_message_id: lastMessageId,
        }),
      });
      lastMarkedRef.current = lastMessageId;
      if (onConversationUpdated) onConversationUpdated();
    } catch (e) {
      console.error("Error marcando leído:", e);
    }
  }

  async function loadAudit() {
    if (!session?.session_id) return;

    try {
      const res = await fetch(
        `/api/conversations/audit?session_id=${session.session_id}&limit=10`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setAuditItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error cargando auditoría:", e);
      setAuditItems([]);
    }
  }

  async function loadTimeline() {
    if (!session?.session_id) return;

    setTimelineLoading(true);
    try {
      const res = await fetch(
        `/api/conversations/timeline?session_id=${session.session_id}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      const parsed = Array.isArray(data) ? data : [];
      setMessages(parsed);

      const latestInbound = [...parsed]
        .reverse()
        .find((m) => (m?.message_direction || "") === "inbound" || Boolean(m?.pregunta));

      if (latestInbound?.id) {
        await markAsRead(latestInbound.id);
      }
    } catch (e) {
      console.error("Error cargando timeline:", e);
      setMessages([]);
      setError("No se pudo cargar los mensajes. Intentá de nuevo.");
    } finally {
      setTimelineLoading(false);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Enviar mensaje
  // ─────────────────────────────────────────────────────────────

  async function sendMessage() {
    const text = newMessage.trim();
    if (!text || !session?.session_id || sending) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/conversations/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.session_id,
          text,
          direction: "outbound",
          source: "manual_ui",
          source_channel: channelToSend,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "No se pudo enviar el mensaje");
      }

      setNewMessage("");
      await loadTimeline();
      if (onConversationUpdated) onConversationUpdated();
    } catch (e) {
      setError(e?.message || "Error enviando mensaje");
    } finally {
      setSending(false);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!session?.session_id) return;
    lastMarkedRef.current = 0;
    setAssignedAgentId(session?.assigned_agent_id ? String(session.assigned_agent_id) : "");
    setAssignmentStatus(session?.assignment_status || "unassigned");
    setPriorityLevel(session?.priority_level || "normal");
    setSlaDueAt(toDatetimeLocalValue(session?.sla_due_at));
    loadAgents();
    loadAudit();
    loadTimeline();
  }, [session]);

  useEffect(() => {
    if (!session?.session_id) return;

    const timer = setInterval(() => {
      loadTimeline();
    }, 5000);

    return () => clearInterval(timer);
  }, [session]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function handleScroll() {
      const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      stickToBottomRef.current = distanceToBottom < 80;
    }

    el.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (stickToBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!session?.session_id) return;
    if (!focusComposerSignal) return;

    const node = composerRef.current;
    if (!node) return;

    node.focus();
    const end = node.value?.length || 0;
    node.setSelectionRange(end, end);
  }, [focusComposerSignal, session?.session_id]);

  // ─────────────────────────────────────────────────────────────
  // Canal automático: detectar del último mensaje entrante
  // ─────────────────────────────────────────────────────────────

  const channelToSend = useMemo(() => {
    const lastInbound = [...messages].reverse().find(
      (m) => (m?.message_direction || "") === "inbound" || Boolean(m?.pregunta)
    );
    return (lastInbound?.source_channel || session?.source_channel || "whatsapp").toLowerCase();
  }, [messages, session]);

  // ─────────────────────────────────────────────────────────────
  // Resumen desde el timeline
  // ─────────────────────────────────────────────────────────────

  const resumen = useMemo(() => {
    // El campo resumen viene en cada row del timeline tomado de conversation_sessions.conversation_summary
    if (messages.length > 0) {
      const lastWithResumen = [...messages].reverse().find((m) => m?.resumen && String(m.resumen).trim());
      if (lastWithResumen?.resumen) return String(lastWithResumen.resumen).trim();
    }
    return session?.resumen || "Sin resumen disponible.";
  }, [messages, session]);

  // ─────────────────────────────────────────────────────────────
  // Render vacío
  // ─────────────────────────────────────────────────────────────

  if (!session?.session_id) {
    return (
      <div className="h-full border rounded-xl bg-white shadow flex items-center justify-center text-sm text-gray-500">
        Selecciona una conversación para comenzar.
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Render principal
  // ─────────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <div className="h-full border rounded-xl bg-white shadow flex flex-col">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="border-b p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  onClick={onBack}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Volver a la lista</TooltipContent>
            </Tooltip>

            <div className="font-semibold flex-1 min-w-0 truncate">
              {session?.cliente_nombre || "Conversación"}
            </div>

            {/* Badge de estado — Popover de gestión compacto */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 text-xs hover:bg-gray-50 transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full ${
                    assignmentStatus === "open" ? "bg-green-500" :
                    assignmentStatus === "pending" ? "bg-amber-400" :
                    assignmentStatus === "closed" ? "bg-gray-400" :
                    "bg-gray-300"
                  }`} />
                  <span className="text-gray-600">
                    {assignmentStatus === "open" ? "Abierta" :
                     assignmentStatus === "pending" ? "Pendiente" :
                     assignmentStatus === "closed" ? "Cerrada" :
                     "Sin asignar"}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-40" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 space-y-2 p-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">Gestión de conversación</p>
                <select
                  className="h-9 w-full rounded-md border bg-white px-3 text-sm"
                  value={assignedAgentId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setAssignedAgentId(nextId);
                    const nextStatus = nextId
                      ? (assignmentStatus === "unassigned" ? "open" : assignmentStatus)
                      : "unassigned";
                    setAssignmentStatus(nextStatus);
                    saveAssignment(nextId, nextStatus);
                  }}
                  disabled={savingAssignment}
                >
                  <option value="">Sin asignar</option>
                  {agents.map((a) => (
                    <option key={a.id} value={String(a.id)}>{a.fullname}</option>
                  ))}
                </select>
                <select
                  className="h-9 w-full rounded-md border bg-white px-3 text-sm"
                  value={assignmentStatus}
                  onChange={(e) => {
                    const nextStatus = e.target.value;
                    setAssignmentStatus(nextStatus);
                    saveAssignment(assignedAgentId, nextStatus);
                  }}
                  disabled={savingAssignment}
                >
                  <option value="unassigned">Sin asignar</option>
                  <option value="open">Abierta</option>
                  <option value="pending">Pendiente</option>
                  <option value="closed">Cerrada</option>
                </select>
                <select
                  className="h-9 w-full rounded-md border bg-white px-3 text-sm"
                  value={priorityLevel}
                  onChange={(e) => {
                    const nextPriority = e.target.value;
                    setPriorityLevel(nextPriority);
                    savePriority(nextPriority, slaDueAt);
                  }}
                  disabled={savingPriority}
                >
                  <option value="low">Prioridad baja</option>
                  <option value="normal">Prioridad normal</option>
                  <option value="high">Prioridad alta</option>
                  <option value="urgent">Prioridad urgente</option>
                </select>
                {(assignmentError || priorityError) && (
                  <p className="text-xs text-red-600">{assignmentError || priorityError}</p>
                )}
              </PopoverContent>
            </Popover>

            {/* Popover Resumen */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[320px]">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Resumen de conversación</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{resumen}</p>
                    </div>
                  </PopoverContent>
                </Popover>
              </TooltipTrigger>
              <TooltipContent>Ver resumen generado de la conversación</TooltipContent>
            </Tooltip>
          </div>

          <p className="text-sm text-gray-500 mt-1">{session?.celular || session?.phone}</p>
        </div>

        {/* ── Timeline de mensajes ─────────────────────────────── */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
          {timelineLoading && messages.length === 0 && (
            <div className="flex items-center justify-center py-8 text-sm text-gray-400 italic">
              Cargando mensajes...
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className="space-y-1">
              {m.pregunta && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 px-3 py-2 rounded-xl max-w-[80%] text-sm">
                    <p>{m.pregunta}</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      {m.source_channel || "canal"}
                      {m.message_status ? ` · ${m.message_status}` : ""}
                    </p>
                  </div>
                </div>
              )}

              {m.respuesta && (
                <div className="flex justify-end">
                  <div className="bg-[#5e17eb] text-white px-3 py-2 rounded-xl max-w-[80%] text-sm">
                    <p>{m.respuesta}</p>
                    <p className="text-[11px] text-indigo-100 mt-1 text-right">
                      {m.source_channel || "manual"}
                      {m.message_status ? ` · ${m.message_status}` : ""}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Compositor ──────────────────────────────────────── */}
        <div className="border-t p-3 space-y-2">
          <div className="flex flex-col sm:flex-row gap-2 items-stretch">
            <Textarea
              ref={composerRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje para el cliente..."
              className="min-h-24 sm:flex-1"
              disabled={sending}
            />

            <div className="sm:w-36 flex flex-col gap-2 justify-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`h-7 px-2.5 rounded-full border flex items-center gap-1.5 text-[11px] font-medium cursor-default self-end ${
                    channelToSend === "instagram"
                      ? "border-pink-200 bg-pink-50 text-pink-700"
                      : channelToSend === "facebook"
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-green-200 bg-green-50 text-green-700"
                  }`}>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      channelToSend === "instagram" ? "bg-pink-500" :
                      channelToSend === "facebook" ? "bg-blue-500" :
                      "bg-green-500"
                    }`} />
                    {channelToSend === "instagram" ? "Instagram" :
                     channelToSend === "facebook" ? "Facebook" :
                     "WhatsApp"}
                  </div>
                </TooltipTrigger>
                <TooltipContent>Respondiendo por {channelToSend} — canal del cliente</TooltipContent>
              </Tooltip>

              <Button className="w-full" onClick={() => sendMessage()} disabled={sending || !newMessage.trim()}>
                <Send className="h-4 w-4 mr-2" />
                {sending ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

      </div>
    </TooltipProvider>
  );
}
