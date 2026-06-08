import { API_BASE } from "../config/api";
import { getAuthToken } from "../context/authToken";

export type DashboardIsland = {
  id: string;
  name: string;
  display_name?: string | null;
  is_visible?: boolean;
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
  channel_id?: string | null;
  access_source?: string | null;
  access_status?: DashboardIslandRoleStatus;
  discord_bot_online?: boolean;
  fs_path?: string | null;
  fs_type?: string | null;
  fs_dodo?: string | null;
  fs_visitors?: number | null;
  allowed_categories?: string[];
  allowed_themes?: string[];
  allowed_statuses?: string[];
  r2_configured?: boolean;
  sparkline_7d?: Array<{ day: string; count: number }>;
};

export type DashboardRole = {
  id: string;
  name: string;
};

export type DashboardIslandRoleStatus = {
  id: string;
  name: string;
  cat: string;
  type: string;
  is_member: boolean;
  channel_id?: string | null;
  access_source: string;
  required_roles: DashboardRole[];
  required_role_ids: string[];
  role_count: number;
  warnings: string[];
  ok: boolean;
};

export type DashboardRoleStatus = {
  timestamp: string;
  discord_configured: boolean;
  category_id: string;
  total: number;
  member_islands: number;
  problem_count: number;
  items: DashboardIslandRoleStatus[];
};

export type DashboardRoleSyncResult = {
  timestamp?: string;
  discord_configured?: boolean;
  synced: number;
  skipped: number;
  errors: Array<string | Record<string, unknown>>;
  items?: Array<{
    id: string;
    name: string;
    channel_id?: string | null;
    required_roles: string[];
    role_count: number;
    access_source: string;
  }>;
};

export type DashboardAccessTestResult = {
  user_id?: string | null;
  roles: DashboardRole[];
  is_mod: boolean;
  accessible_count: number;
  items: Array<{
    id: string;
    name: string;
    cat: string;
    type: string;
    channel_id?: string | null;
    access_source: string;
    accessible: boolean;
    required_roles: DashboardRole[];
    matched_roles: DashboardRole[];
  }>;
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
  access_problem_count?: number;
  islands: Array<{
    id: string;
    name: string;
    status: string;
    access_source?: string;
    role_count?: number;
    access_warnings?: string[];
  }>;
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

export type WebsiteLoginEvent = {
  id: number;
  user_id: string;
  username?: string;
  discord_name?: string;
  global_name?: string;
  account_name?: string;
  nickname?: string;
  avatar?: string;
  roles: string[];
  role_count: number;
  is_admin: boolean;
  is_mod: boolean;
  ip_address?: string;
  user_agent?: string;
  return_to?: string;
  discord_message_id?: string | null;
  discord_channel_id?: string | null;
  discord_guild_id?: string | null;
  created_at: string;
};

export type WebsiteLoginEvents = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  entries: WebsiteLoginEvent[];
  filters: Record<string, string>;
  summary: {
    total: number;
    mod_count: number;
    admin_count: number;
  };
};

export type DashboardOpsStatus = {
  status: string;
  timestamp: string;
  uptime_seconds?: number;
  reasons?: string[];
  database?: {
    status?: string;
    backend?: string;
    latency_ms?: number;
  };
  cache?: {
    items?: number;
    age_seconds?: number;
    last_refresh_status?: string;
    last_refresh_error?: string | null;
  };
  maintenance?: Record<string, unknown>;
  services?: Record<string, {
    status?: string;
    mode?: string;
    last_heartbeat?: string;
    last_error?: string | null;
  }>;
  integrations?: Record<string, boolean>;
  db_type?: string;
  sqlite_counts?: Record<string, number>;
};

export type DashboardBackupList = {
  backup_dir?: string;
  backend?: string;
  entries?: Array<{ file: string; created_at?: string; size_bytes?: number }>;
};

export type DashboardIncidentEvent = {
  kind: string;
  source_id: string;
  severity: string;
  title: string;
  timestamp: string;
  user_id?: string | number | null;
  trust_profile_url?: string | null;
  status?: string;
  assigned_to?: string;
  note?: string;
  workflow?: Record<string, unknown> | null;
  payload?: Record<string, unknown>;
};

export type DashboardIncidentsPayload = {
  ok: boolean;
  summary: Record<string, number>;
  events: DashboardIncidentEvent[];
  open_queue?: DashboardDodoQueueEntry[];
  workflow?: Array<Record<string, unknown>>;
};

export type DashboardDodoQueueEntry = {
  id: number;
  island_name: string;
  island_clean: string;
  user_id: string;
  username?: string;
  status: string;
  note?: string;
  created_at: number | string;
  updated_at: number | string;
};

export type DashboardTrustTimelineItem = {
  type: string;
  label: string;
  title: string;
  timestamp: string;
  severity: string;
  payload?: Record<string, unknown>;
};

export type DashboardUserTrust = {
  ok: boolean;
  user_id: string;
  user_name?: string;
  risk_score: number;
  trust_state: string;
  status_label: string;
  risk_flags: string[];
  summary: Record<string, unknown>;
  known_igns: Array<Record<string, unknown>>;
  recent_visits: Array<Record<string, unknown>>;
  recent_actions: Array<Record<string, unknown>>;
  recent_dodo_reveals: Array<Record<string, unknown>>;
  recent_identity_events: Array<Record<string, unknown>>;
  timeline: DashboardTrustTimelineItem[];
};

export class DashboardApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const dashboardUrl = (path: string) => `${API_BASE}/dashboard/api${path}`;

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
  syncMaps: () => dashboardRequest<{ synced: number; skipped: number; errors: string[] }>("/islands/sync-maps", { method: "POST" }),
  roleStatus: (refresh = false) => dashboardRequest<DashboardRoleStatus>(`/islands/role-status${refresh ? "?refresh=1" : ""}`),
  syncRoles: () => dashboardRequest<DashboardRoleSyncResult>("/islands/sync-roles", { method: "POST" }),
  testAccess: (payload: { user_id?: string; roles?: string[]; is_mod?: boolean; is_admin?: boolean }) =>
    dashboardRequest<DashboardAccessTestResult>("/islands/test-access", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  logs: (params = "") => dashboardRequest<DashboardLogs>(`/logs${params ? `?${params}` : ""}`),
  websiteLogins: (params = "") => dashboardRequest<WebsiteLoginEvents>(`/website-logins${params ? `?${params}` : ""}`),
  analytics: (islandType = "") => dashboardRequest<DashboardAnalytics>(`/analytics${islandType ? `?island_type=${encodeURIComponent(islandType)}` : ""}`),
  analyticsExportUrl: (islandType = "") => dashboardUrl(`/analytics/export.csv${islandType ? `?island_type=${encodeURIComponent(islandType)}` : ""}`),
  migrationStatus: () => dashboardRequest<MigrationStatus>("/mariadb-migration/status"),
  runMigration: (dryRun = true, truncateBeforeImport = false) =>
    dashboardRequest<MigrationStatus>("/mariadb-migration", {
      method: "POST",
      body: JSON.stringify({ dry_run: dryRun, truncate_before_import: truncateBeforeImport }),
    }),
  runtimeStatus: () => dashboardRequest<DashboardOpsStatus>("/runtime-status"),
  backups: () => dashboardRequest<DashboardBackupList>("/backups"),
  maintenanceMode: (payload: Record<string, unknown>) => dashboardRequest<unknown>("/maintenance-mode", { method: "POST", body: JSON.stringify(payload) }),
  incidents: (limit = 50) => dashboardRequest<DashboardIncidentsPayload>(`/incidents?limit=${encodeURIComponent(limit)}`),
  updateIncident: (payload: Partial<DashboardIncidentEvent> & { kind: string; source_id: string }) =>
    dashboardRequest<{ ok: boolean; incident: Record<string, unknown> | null }>("/incidents", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  dodoQueue: (status = "waiting,called,investigating") =>
    dashboardRequest<{ ok: boolean; items: DashboardDodoQueueEntry[] }>(`/dodo-queue?status=${encodeURIComponent(status)}`),
  updateDodoQueue: (id: number | string, status: string, note = "") =>
    dashboardRequest<{ ok: boolean; updated: number }>("/dodo-queue", {
      method: "PATCH",
      body: JSON.stringify({ id, status, note }),
    }),
  userTrustProfile: (userId: string) => dashboardRequest<DashboardUserTrust>(`/user-trust-profile?user_id=${encodeURIComponent(userId)}`),
};
