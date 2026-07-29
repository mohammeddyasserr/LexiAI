import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, User, FileText, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { askChatQuestion } from "@/lib/chat-api";
import { ContractSelector } from "@/components/contract-selector";
import { getContracts } from "@/lib/contracts-api";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat — Lexis AI" },
      {
        name: "description",
        content: "Ask questions about your contracts in natural language.",
      },
    ],
  }),
  component: Chat,
});

type Msg = {
  role: "user" | "assistant";
  text: string;
  refs?: { clause: string; page: number }[];
  confidence?: number;
};

function Chat() {
  const location = useLocation();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const selectedContractId = useMemo(
    () => getContractId(location.search),
    [location.search],
  );

  const { data: contracts = [] } = useQuery({
    queryKey: ["contracts"],
    queryFn: getContracts,
  });

  const selectedContract = useMemo(
    () =>
      contracts.find((contract) => contract.id === selectedContractId) ?? null,
    [contracts, selectedContractId],
  );

  const greeting = useMemo(() => {
    if (selectedContract) {
      return `Hello — I’m ready to answer questions about ${selectedContract.name}. Ask me anything about its clauses, obligations, or risks.`;
    }

    if (selectedContractId) {
      return "Hello — I’m ready to answer questions about the selected contract. Ask me anything about its clauses, obligations, or risks.";
    }

    return "Hello — select a contract to start asking questions about its clauses, obligations, and risks.";
  }, [selectedContract, selectedContractId]);

  const contextDetails = useMemo(() => {
    if (!selectedContract) {
      return "Select a contract to view its details.";
    }

    const details = [
      selectedContract.parties.length > 0
        ? selectedContract.parties.join(" · ")
        : null,
      selectedContract.date,
      selectedContract.amount,
    ].filter(Boolean);

    return details.join(" • ");
  }, [selectedContract]);

  useEffect(() => {
    setMessages([{ role: "assistant", text: greeting }]);
    setErrorMessage(null);
  }, [greeting]);

  const handleContractChange = () => {
    setErrorMessage(null);
  };

  const send = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Msg = { role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await askChatQuestion({
        question: text,
        contract_id: selectedContractId ?? undefined,
      });

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: response.answer,
          refs: response.sources.map((source) => ({
            clause: source.section ?? "Source",
            page: source.page ?? 1,
          })),
          confidence: response.confidence,
        },
      ]);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Sorry, I couldn’t reach the AI assistant right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      title="AI Contract Chat"
      subtitle={selectedContract?.name ?? "Select a contract to begin"}
    >
      <div className="grid gap-5 lg:grid-cols-4 h-[calc(100vh-8rem)]">
        {/* Sidebar - context */}
        <Card className="hidden lg:flex lg:col-span-1 p-5 border-border flex-col gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Context
          </div>
          <ContractSelector onContractChange={handleContractChange} />
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border/80 bg-muted/30">
            <FileText className="h-5 w-5 text-destructive" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {selectedContract?.name ?? "Select a contract"}
              </div>
              <div className="text-xs text-muted-foreground">
                {contextDetails}
              </div>
            </div>
          </div>
        </Card>

        {/* Chat */}
        <Card className="lg:col-span-3 border-border flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {messages.map((m, i) => (
              <MessageBubble key={i} msg={m} />
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-8 w-8 rounded-lg gradient-ai flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-accent animate-bounce" />
                  <span
                    className="h-2 w-2 rounded-full bg-accent animate-bounce"
                    style={{ animationDelay: "120ms" }}
                  />
                  <span
                    className="h-2 w-2 rounded-full bg-accent animate-bounce"
                    style={{ animationDelay: "240ms" }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-border/80 p-3.5">
            {errorMessage && (
              <div className="mb-3 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="relative flex items-center gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about this contract…"
                className="h-10 pr-14"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1.5 h-8 w-8 rounded-xl gradient-navy text-white shadow-sm hover:opacity-90"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
          isUser ? "gradient-navy text-white" : "gradient-ai text-white",
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </div>
      <div className={cn("max-w-[80%] space-y-2", isUser && "text-right")}>
        <div
          className={cn(
            "inline-block text-sm leading-relaxed rounded-2xl px-4 py-2.5",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted rounded-tl-sm",
          )}
        >
          {msg.text}
        </div>
        {msg.refs && (
          <div className="flex flex-wrap gap-1.5">
            {msg.refs.map((r, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded-md bg-accent/10 text-accent border border-accent/20 font-medium"
              >
                {r.clause} · p.{r.page}
              </span>
            ))}
          </div>
        )}
        {msg.confidence !== undefined && (
          <div className="text-[11px] text-muted-foreground">
            Confidence:{" "}
            <span className="font-semibold text-foreground">
              {msg.confidence}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function getContractId(search: string | Record<string, unknown> | undefined) {
  if (!search) return null;

  if (typeof search === "string") {
    const params = new URLSearchParams(search);
    return params.get("contractId") ?? params.get("contract_id");
  }

  return typeof search.contractId === "string"
    ? search.contractId
    : typeof search.contract_id === "string"
      ? search.contract_id
      : null;
}
