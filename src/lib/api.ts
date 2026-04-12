const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

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

async function putter<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
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
  updateCampaignBudget: (id: string, daily_budget: number) => patcher<any>(`/meta-actions/campaigns/${id}/budget`, { daily_budget }),
  updateAdsetStatus: (id: string, status: string) => patcher<any>(`/meta-actions/adsets/${id}/status`, { status }),
  updateAdsetBudget: (id: string, daily_budget: number) => patcher<any>(`/meta-actions/adsets/${id}/budget`, { daily_budget }),

  // Agent
  getAgentStatus: () => fetcher<any>("/agent/status"),
  triggerAgent: () => poster<any>("/agent/run", {}),
  getAgentConfig: () => fetcher<any>("/agent/config"),
  getTokenStatus: () => fetcher<any>("/agent/token-status"),

  // Sales
  getSales: (params?: string) => fetcher<any>(`/sales${params ? `?${params}` : ""}`),
  getSalesSummary: () => fetcher<any>("/sales/summary"),
  getSalesByCampaign: () => fetcher<any>("/sales/by-campaign"),
  getSalesByHour: () => fetcher<any>("/sales/by-hour"),
  getSalesHeatmap: () => fetcher<any>("/sales/heatmap"),
  getSalesLtv: () => fetcher<any>("/sales/ltv"),
  getDiscrepancy: () => fetcher<any>("/sales/discrepancy"),
  convertToMentoria: (id: string) => patcher<any>(`/sales/${id}/convert-mentoria`, {}),

  // Metrics extended
  getOverviewCompare: (period?: string) => fetcher<any>(`/metrics/overview?period=${period || "7d"}&compare=previous`),
  getScore: () => fetcher<any>("/metrics/score"),
  getScalingRules: () => fetcher<any>("/metrics/scaling-rules"),
  getBudgetRebalance: () => fetcher<any>("/metrics/budget-rebalance"),
  getAudienceOverlap: () => fetcher<any>("/metrics/audience-overlap"),
  getFrequencyByAdset: () => fetcher<any>("/metrics/frequency-by-adset"),
  getAscPerformance: () => fetcher<any>("/metrics/asc-performance"),

  // Placement
  getPlacementMetrics: (period?: string) => fetcher<any>(`/placement-metrics${period ? `?period=${period}` : ""}`),

  // Pacing
  getPacing: () => fetcher<any>("/meta-actions/insights/pacing"),

  // Briefing
  getDailyBriefing: () => fetcher<any>("/briefing/daily"),
  getWeeklyBriefing: () => fetcher<any>("/briefing/weekly"),

  // Profit
  getProfit: (period?: string) => fetcher<any>(`/profit${period ? `?period=${period}` : ""}`),

  // Goals
  setGoal: (data: any) => poster<any>("/goals", data),
  getGoalProgress: () => fetcher<any>("/goals/progress"),

  // Health
  getHealth: () => fetcher<any>("/health"),

  // Actions log
  getActionLog: (limit?: number) => fetcher<any>(`/actions/log${limit ? `?limit=${limit}` : ""}`),

  // Creative lifecycle
  getCreativeLifecycle: () => fetcher<any>("/creatives/lifecycle"),

  // Notifications
  getNotificationConfig: () => fetcher<any>("/notifications/config"),
  setNotificationConfig: (data: any) => poster<any>("/notifications/config", data),
  getNotificationLog: () => fetcher<any>("/notifications/log"),

  // Tests A/B
  getActiveTests: () => fetcher<any>("/tests/active"),
  createTest: (data: any) => poster<any>("/tests/create", data),
  decideTest: (id: string, winner: string) => poster<any>(`/tests/${id}/decide`, { winner }),

  // Campaign Builder
  getTemplates: () => fetcher<any[]>("/campaign-builder/templates"),
  uploadCreative: (data: any) => poster<any>("/campaign-builder/upload-creative", data),
  buildCampaign: (data: any) => poster<any>("/campaign-builder/build", data),
  distributeCreative: (data: any) => poster<any>("/campaign-builder/distribute", data),

  // Event Match Quality
  getEventMatchQuality: () => fetcher<any>("/agent/event-match-quality"),

  // Reports
  generateReport: (data: any) => poster<any>("/reports/generate", data),

  // Notification Config (WhatsApp)
  getNotifConfig: () => fetcher<any>("/notifications/config"),
  updateNotifConfig: (data: any) => putter<any>("/notifications/config", data),
  getNotifLog: () => fetcher<any[]>("/notifications/log"),
  testNotification: () => poster<any>("/notifications/test", {}),
  getNotificationHealth: () =>
    fetcher<{
      status: "healthy" | "warning" | "critical";
      reason: string;
      last_success_at: string | null;
      hours_since_last_success: number | null;
      sent_last_24h: number;
      failed_last_24h: number;
      consecutive_failures: number;
    }>("/notifications/health"),

  // Automation Config
  getAutomationConfig: () => fetcher<any>("/automations/config"),
  updateAutomationConfig: (data: any) => putter<any>("/automations/config", data),

  // Automation Locks
  getAutomationLocks: () => fetcher<any>("/automations/locks"),
  deleteAutomationLock: (id: string) => deleter(`/automations/locks/${id}`),

  // Agent Heartbeat
  getHeartbeat: () => fetcher<any>("/agent/heartbeat"),

  // Funnel Analysis (Ponto 5)
  getFunnel: (period?: string) => fetcher<any>(`/metrics/funnel${period ? `?period=${period}` : ""}`),

  // Ad Diagnostics (Ponto 6)
  getAdDiagnostics: (period?: string) => fetcher<any>(`/metrics/ad-diagnostics${period ? `?period=${period}` : ""}`),

  // Creative Stock (Ponto 7)
  getCreativeStock: () => fetcher<any>("/creatives/stock"),

  // ThruPlay Analysis (Ponto 8)
  getThruplayAnalysis: () => fetcher<any>("/creatives/thruplay-analysis"),

  // CPM Trend (Ponto 9)
  getCpmTrend: (days?: number) => fetcher<any>(`/metrics/cpm-trend${days ? `?days=${days}` : ""}`),

  // Comment Analysis (Ponto 10)
  getCommentSummary: () => fetcher<any>("/comments/summary"),
  getCommentsByAd: (adId: string) => fetcher<any>(`/comments/by-ad/${adId}`),

  // Lookalike Audiences (Ponto 11)
  getLookalikes: () => fetcher<any>("/audiences/lookalikes"),

  // Campaign Builder (Ponto 1)
  getLaunchTemplates: () => fetcher<any>("/campaign-builder/launch-templates"),
  getBuilderAudiences: () => fetcher<any>("/campaign-builder/audiences"),
  getBuilderCampaigns: () => fetcher<any>("/campaign-builder/campaigns"),
  uploadMedia: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetch(`${API_URL}/campaign-builder/upload`, { method: "POST", body: formData }).then(r => r.json());
  },
  previewCreative: (data: any) => poster<any>("/campaign-builder/preview", data),
  launchCampaign: (data: any) => poster<any>("/campaign-builder/launch", data),

  // Budget Allocation (Ponto 5)
  getBudgetAllocation: () => fetcher<any>("/automations/budget-allocation"),
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
  metaCampaignId: string | null;
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
