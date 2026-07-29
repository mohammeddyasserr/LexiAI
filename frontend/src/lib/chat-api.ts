export interface ChatRequest {
  question: string;
  contract_id?: string | null;
  debug?: boolean;
}

export interface ChatSource {
  contract_id?: string | number | null;
  section?: string | null;
  page?: number | null;
}

export interface ChatResponse {
  status: string;
  question: string;
  answer: string;
  confidence: number;
  sources: ChatSource[];
}

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
).replace(/\/$/, "");

export async function askChatQuestion(
  request: ChatRequest,
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/RAG/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Unable to get AI chat response from the backend.", text);
    throw new Error("Unable to get AI chat response from the backend.");
  }

  return response.json();
}
