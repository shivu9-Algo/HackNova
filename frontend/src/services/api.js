/**
 * API Client for AegisGuard AI Agent Safety Gateway.
 * Interacts with FastAPI backend endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Stats and Audit Logs
  getStats: () => request('/stats'),
  getLogs: (limit = 100) => request(`/logs?limit=${limit}`),
  resetLogs: () => request('/logs/reset', { method: 'POST' }),

  // Human in the loop Approvals
  approveAction: (id, reviewerComment = '') =>
    request(`/approve/${id}`, {
      method: 'POST',
      body: JSON.stringify({ reviewer_comment: reviewerComment }),
    }),

  rejectAction: (id, reviewerComment = '') =>
    request(`/reject/${id}`, {
      method: 'POST',
      body: JSON.stringify({ reviewer_comment: reviewerComment }),
    }),

  // Emergency Kill Switch
  getKillSwitch: () => request('/killswitch'),
  toggleKillSwitch: (active = null) =>
    request('/killswitch', {
      method: 'POST',
      body: JSON.stringify(active !== null ? { active } : {}),
    }),

  // Agent Interception & Demo
  sendAction: (payload) =>
    request('/action', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  runScenario: (scenarioId, amount = null) =>
    request(`/demo/scenario/${scenarioId}`, {
      method: 'POST',
      body: amount !== null && amount !== undefined ? JSON.stringify({ amount: parseFloat(amount) }) : undefined,
    }),

  runAllScenarios: () =>
    request('/demo/run-all', {
      method: 'POST',
    }),

  // Security Rules Configuration
  getRules: () => request('/rules'),
  updateRules: (rulesObj) =>
    request('/rules', {
      method: 'PUT',
      body: JSON.stringify(rulesObj),
    }),

  // Real LLM / Fallback Agent Endpoints
  getAgentStatus: () => request('/agent/status'),
  getAgentInbox: () => request('/agent/inbox'),
  runAgentTask: (task, mode = 'auto', apiKey = null, waitForEscalations = true) =>
    request('/agent/run', {
      method: 'POST',
      body: JSON.stringify({
        task,
        mode,
        api_key: apiKey || undefined,
        wait_for_escalations: waitForEscalations,
      }),
    }),
  setAgentApiKey: (apiKey) =>
    request('/agent/key', {
      method: 'POST',
      body: JSON.stringify({ api_key: apiKey }),
    }),
};
