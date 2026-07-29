export interface ReportHeader {
  title?: string;
  subtitle?: string;
  party_1?: string;
  party_2?: string;
  duration?: string;
  contract_value?: string;
}

export interface ReportKpiCards {
  risk_score?: number | null;
  clauses?: number | null;
  findings?: number | null;
}

export interface ReportFinding {
  text?: string;
  sentiment?: string;
}

export interface ReportKeyFindings {
  findings?: ReportFinding[];
}

export interface ReportClause {
  type?: string;
  text?: string;
  page_no?: number | null;
}

export interface ReportImportantClauses {
  important_clauses?: ReportClause[];
}

export interface ReportResponse {
  header?: ReportHeader;
  kpi_cards?: ReportKpiCards;
  executive_summary?: string | null;
  key_findings?: ReportKeyFindings | null;
  important_clauses?: ReportImportantClauses | null;
  risk_analysis?: string | null;
  recommendations?: string | null;
}

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
).replace(/\/$/, "");

export async function getReport(contractId: string): Promise<ReportResponse> {
  const url = `${API_BASE_URL}/report/${encodeURIComponent(contractId)}`;

  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    console.error("Unable to load executive report from the backend.", text);
    throw new Error("Unable to load executive report from the backend.");
  }

  return response.json();
}
