export interface DashboardStatsResponse {
  total_contracts: {
    count: number;
    change: string;
  };
  analyzed_contracts: {
    count: number;
    change: string;
    coverage: string;
  };
  avg_risk_score: {
    score: number;
    change: string;
  };
  compliance_rate: {
    rate: string;
    change: string;
  };
  monthly_trend: Array<{
    month: string;
    uploaded: number;
    analyzed: number;
  }>;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
).replace(/\/$/, "");

export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`);

  if (!response.ok) {
    const text = await response.text();
    console.error("Unable to load dashboard stats from the backend.", text);
    throw new Error("Unable to load dashboard stats from the backend.");
  }

  return response.json();
}
