import { API_BASE } from "../config/api";
import { getAuthToken } from "../context/authToken";

export type DashboardIsland = {
  id: string;
  name: string;
  type: string;
  items: string[];
  theme: string;
  cat: string;
  description: string;
  seasonal: string;
  status: string;
  visitors: number;
  dodo_code?: string | null;
  map_url?: string | null;
  updated_at?: string | null;
  required_roles: string[];
  discord_bot_online?: boolean;
};

export type DashboardOverview = {
  total_visits: number;
  total_warnings: number;
  visits_today: number;
  visits_week: number;
  warnings_week: number;
  warn_rate_7d: number;
  island_count: number;
  online_count: number;
  online_pct: number;
  status_map: Record<string, number>;
  top_islands: Array<{ name: string; count: number }>;
  top_travelers: Array<{ ign: string; count: number }>;
  trend_labels: string[];
  trend_counts: number[];
  recent: Array<Record<string, unknown>>;
};

export type DashboardStatusSummary = {
  island_count: number;
  online_count: number;
  refreshing_count: number;
  offline_count: number;
  online_pct: number;
  refreshing_pct: number;
  off_pct: number;
  islands: Array<{ id: string; name: string; status: string }>;
};

export type DashboardLogs = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  log_type: string;
  entries: Array<Record<string, unknown>>;
  island_names: string[];
};

export type DashboardAnalytics = Record<string, unknown>;
export type MigrationStatus = Record<string, unknown>;

export class DashboardApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const dashboardUrl = (path: string) => `${API_BASE}/dashboard/api${path}`;

export const dashboardRequest = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const token = getAuthToken();
  if (!token) throw new DashboardApiError(401, "Missing auth token");

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const resp = await fetch(dashboardUrl(path), { ...init, headers });
  const contentType = resp.headers.get("Content-Type") || "";
  const payload = contentType.includes("application/json") ? await resp.json().catch(() => null) : null;

  if (!resp.ok) {
    const message = String(payload?.error || `Request failed (${resp.status})`);
    if (message.includes("DASHBOARD_SECRET")) {
      throw new DashboardApiError(
        resp.status,
        "The backend dashboard API is still using the old secret-only auth. Deploy the updated chobot backend first.",
      );
    }
    throw new DashboardApiError(resp.status, message);
  }

  return payload as T;
};

export const dashboardApi = {
  overview: () => dashboardRequest<DashboardOverview>("/overview"),
  statusSummary: () => dashboardRequest<DashboardStatusSummary>("/status-summary"),
  islands: () => dashboardRequest<DashboardIsland[]>("/islands"),
  island: (id: string) => dashboardRequest<DashboardIsland>(`/islands/${encodeURIComponent(id)}`),
  updateIsland: (id: string, data: Partial<DashboardIsland>) =>
    dashboardRequest<{ status: string; id: string }>(`/islands/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  uploadMap: (id: string, file: File) => {
    const form = new FormData();
    form.append("map", file);
    return dashboardRequest<{ map_url: string }>(`/islands/${encodeURIComponent(id)}/map`, {
      method: "POST",
      body: form,
    });
  },
  logs: (params = "") => dashboardRequest<DashboardLogs>(`/logs${params ? `?${params}` : ""}`),
  analytics: () => dashboardRequest<DashboardAnalytics>("/analytics"),
  migrationStatus: () => dashboardRequest<MigrationStatus>("/mariadb-migration/status"),
  runMigration: (dryRun = true) =>
    dashboardRequest<MigrationStatus>("/mariadb-migration", {
      method: "POST",
      body: JSON.stringify({ dry_run: dryRun }),
    }),
};
