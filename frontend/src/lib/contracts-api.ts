export interface BackendContract {
  contract_id?: string | null;
  title?: string | null;
  parties?: string | null;
  value?: string | null;
  date?: string | null;
  risk?: string | null;
}

export interface Contract {
  id: string;
  name: string;
  type: string;
  date: string;
  risk: "low" | "medium" | "high" | "critical";
  status: "Analyzed" | "Processing" | "Pending" | "Review";
  amount: string;
  parties: string[];
}

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
).replace(/\/$/, "");

export async function getContracts(): Promise<Contract[]> {
  const response = await fetch(`${API_BASE_URL}/contracts`);

  if (!response.ok) {
    const text = await response.text();
    console.error("Unable to load contracts from the backend.", text);
    throw new Error("Unable to load contracts from the backend.");
  }

  const data = (await response.json()) as BackendContract[];

  return data.map((contract, index) => ({
    id: contract.contract_id ?? `contract-${index + 1}`,
    name: contract.title ?? "-",
    type: "Contract",
    date: contract.date ?? "-",
    risk: mapRiskLevel(contract.risk),
    status: "Analyzed",
    amount: contract.value ?? "-",
    parties: formatParties(contract.parties),
  }));
}

function mapRiskLevel(risk?: string | null): Contract["risk"] {
  const normalized = (risk ?? "").toLowerCase();

  if (normalized.includes("critical")) return "critical";
  if (normalized.includes("high")) return "high";
  if (normalized.includes("medium")) return "medium";
  return "low";
}

function formatParties(parties?: string | null): string[] {
  if (!parties) {
    return [];
  }

  return parties
    .split(/\s*[.·]\s*/)
    .map((party) => party.trim())
    .filter(Boolean);
}
