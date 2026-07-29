export interface RiskAnalysisItem {
  title?: string;
  severity?: string;
  reason?: string;
  recommendation?: string;
  type?: string;
  clause?: string;
}

export interface RiskAnalysisResponse {
  contract_id: string;
  risk_score: number;
  risks: RiskAnalysisItem[];
}

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
).replace(/\/$/, "");

export async function getRiskAnalysis(
  contractId: string,
): Promise<RiskAnalysisResponse> {
  const response = await fetch(
    `${API_BASE_URL}/risk/${encodeURIComponent(contractId)}`,
  );

  if (!response.ok) {
    throw new Error("Unable to load risk analysis from the backend.");
  }

  return response.json();
}
