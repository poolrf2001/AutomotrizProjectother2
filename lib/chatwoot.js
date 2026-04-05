const BASE_URL = `${process.env.CHATWOOT_URL}/api/v1/accounts/${process.env.CHATWOOT_ACCOUNT_ID}`;

const headers = {
  api_access_token: process.env.CHATWOOT_API_TOKEN,
  "Content-Type": "application/json",
};

async function chatwootFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Chatwoot ${options.method || "GET"} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

// Conversaciones
export async function getConversations({ status, inboxId, teamId, page = 1 } = {}) {
  const params = new URLSearchParams({ page });
  if (status) params.append("status", status);
  if (inboxId) params.append("inbox_id", inboxId);
  if (teamId) params.append("team_id", teamId);
  return chatwootFetch(`/conversations?${params}`);
}

export async function getConversation(id) {
  return chatwootFetch(`/conversations/${id}`);
}

// Mensajes
export async function getMessages(conversationId) {
  return chatwootFetch(`/conversations/${conversationId}/messages`);
}

export async function sendMessage(conversationId, content, { messageType = "outgoing", private: isPrivate = false } = {}) {
  return chatwootFetch(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content, message_type: messageType, private: isPrivate }),
  });
}

// Asignación
export async function assignConversation(conversationId, { agentId, teamId } = {}) {
  const body = {};
  if (agentId) body.assignee_id = agentId;
  if (teamId) body.team_id = teamId;
  return chatwootFetch(`/conversations/${conversationId}/assignments`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Estado
export async function updateConversationStatus(conversationId, status) {
  return chatwootFetch(`/conversations/${conversationId}/toggle_status`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

// Contactos
export async function searchContacts(query) {
  return chatwootFetch(`/contacts/search?q=${encodeURIComponent(query)}&include_contacts=true`);
}

// Métricas
export async function getAccountSummary({ since, until } = {}) {
  const params = new URLSearchParams();
  if (since) params.append("since", since);
  if (until) params.append("until", until);
  return chatwootFetch(`/reports/summary?${params}`);
}

// Agentes
export async function getAgents() {
  return chatwootFetch("/agents");
}

// Equipos
export async function getTeams() {
  return chatwootFetch("/teams");
}
