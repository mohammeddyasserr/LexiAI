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

  const url = `${API_BASE_URL}/risk/${encodeURIComponent(contractId)}`;

  console.log("API URL:", url);

  const response = await fetch(url);

  console.log("Status:", response.status);

  if (!response.ok) {
    const text = await response.text();
    console.log("Error response:", text);

    throw new Error("Unable to load risk analysis from the backend.");
  }

  const data = await response.json();

  console.log("Risk Data:", data);

  return data;
}