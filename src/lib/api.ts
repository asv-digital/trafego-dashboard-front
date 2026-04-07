const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

async function fetcher<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function poster<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function patcher<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function deleter(path: string): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}

export const api = {
  // Campaigns
  getCampaigns: () => fetcher<Campaign[]>("/campaigns"),
  getCampaign: (id: string) => fetcher<Campaign>(`/campaigns/${id}`),
  createCampaign: (data: CreateCampaignInput) => poster<Campaign>("/campaigns", data),
  updateCampaign: (id: string, data: Partial<Campaign>) => patcher<Campaign>(`/campaigns/${id}`, data),
  deleteCampaign: (id: string) => deleter(`/campaigns/${id}`),

  // Metrics
  getMetrics: (campaignId?: string) =>
    fetcher<MetricEntry[]>(`/metrics${campaignId ? `?campaignId=${campaignId}` : ""}`),
  getOverview: () => fetcher<Overview>("/metrics/overview"),
  createMetric: (data: CreateMetricInput) => poster<MetricEntry>("/metrics", data),
  deleteMetric: (id: string) => deleter(`/metrics/${id}`),

  // Creatives
  getCreatives: (campaignId?: string) =>
    fetcher<Creative[]>(`/creatives${campaignId ? `?campaignId=${campaignId}` : ""}`),
  createCreative: (data: CreateCreativeInput) => poster<Creative>("/creatives", data),
  updateCreative: (id: string, data: Partial<Creative>) => patcher<Creative>(`/creatives/${id}`, data),
  deleteCreative: (id: string) => deleter(`/creatives/${id}`),

  // Alerts
  getAlerts: () => fetcher<Alert[]>("/alerts"),

  // Meta Live Data (from Meta API directly)
  getMetaLiveCampaigns: () => fetcher<any[]>("/meta-actions/campaigns/live"),
  getMetaLiveAdsets: () => fetcher<any[]>("/meta-actions/adsets/live"),
  getMetaRealtimeInsights: () => fetcher<any[]>("/meta-actions/insights/realtime"),
  getMetaInsightsRange: (since: string, until: string, level?: string) =>
    fetcher<any[]>(`/meta-actions/insights/range?since=${since}&until=${until}&level=${level || "campaign"}`),

  // Meta Actions
  createMetaCampaign: (data: any) => poster<any>("/meta-actions/campaigns/create", data),
  createMetaAdset: (data: any) => poster<any>("/meta-actions/adsets/create", data),
  updateCampaignStatus: (id: string, status: string) => patcher<any>(`/meta-actions/campaigns/${id}/status`, { status }),
  updateAdsetStatus: (id: string, status: string) => patcher<any>(`/meta-actions/adsets/${id}/status`, { status }),
  updateAdsetBudget: (id: string, daily_budget: number) => patcher<any>(`/meta-actions/adsets/${id}/budget`, { daily_budget }),

  // Agent
  getAgentStatus: () => fetcher<any>("/agent/status"),
  triggerAgent: () => poster<any>("/agent/run", {}),
  getAgentConfig: () => fetcher<any>("/agent/config"),
};

// Types
export interface Campaign {
  id: string;
  name: string;
  type: string;
  audience: string | null;
  dailyBudget: number;
  startDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  metrics: MetricEntry[];
  creatives: Creative[];
  totalInvestment?: number;
  totalSales?: number;
  totalClicks?: number;
  totalImpressions?: number;
  revenue?: number;
  cpa?: number | null;
  roas?: number | null;
  ctr?: number | null;
}

export interface MetricEntry {
  id: string;
  date: string;
  campaignId: string;
  campaign?: { id: string; name: string };
  adSet: string | null;
  investment: number;
  impressions: number;
  clicks: number;
  sales: number;
  frequency: number | null;
  hookRate: number | null;
  observations: string | null;
  createdAt: string;
  cpm?: number | null;
  cpc?: number | null;
  ctr?: number | null;
  cpa?: number | null;
  roas?: number | null;
  revenue?: number;
}

export interface Creative {
  id: string;
  name: string;
  type: string;
  status: string;
  ctr: number | null;
  hookRate: number | null;
  cpa: number | null;
  campaignId: string;
  campaign?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
  daysActive?: number;
  lifetimeAlert?: boolean;
}

export interface Overview {
  totalInvestment: number;
  totalRevenue: number;
  totalSales: number;
  totalClicks: number;
  totalImpressions: number;
  roas: number;
  cpa: number;
  conversionRate: number;
}

export interface Alert {
  level: "critical" | "red" | "yellow" | "green";
  campaign: string;
  campaignId: string;
  adSet?: string;
  message: string;
  action: string;
  metric?: string;
  value?: number;
}

export interface CreateCampaignInput {
  name: string;
  type: string;
  audience?: string;
  dailyBudget: number;
  startDate: string;
  status?: string;
}

export interface CreateMetricInput {
  date: string;
  campaignId: string;
  adSet?: string;
  investment: number;
  impressions: number;
  clicks: number;
  sales: number;
  frequency?: number;
  hookRate?: number;
  observations?: string;
}

export interface CreateCreativeInput {
  name: string;
  type: string;
  status?: string;
  ctr?: number;
  hookRate?: number;
  cpa?: number;
  campaignId: string;
}
