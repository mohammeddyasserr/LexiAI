import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, User, FileText, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

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

const seed: Msg[] = [
  {
    role: "assistant",
    text: "Hello — I'm your AI legal analyst. I've fully indexed **Global Supply Agreement — Acme Corp** and I'm ready to answer questions about parties, obligations, risks, and specific clauses. What would you like to know?",
  },
];

function Chat() {
  const [messages, setMessages] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      setMessages((m) => [...m, mockReply(text)]);
      setLoading(false);
    }, 900);
  };

  return (
    <AppShell
      title="AI Contract Chat"
      subtitle="Grounded in Global Supply Agreement — Acme Corp"
    >
      <div className="grid gap-5 lg:grid-cols-4 h-[calc(100vh-8rem)]">
        {/* Sidebar - context */}
        <Card className="hidden lg:flex lg:col-span-1 p-5 border-border flex-col">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Context
          </div>
          <div className="mt-3 flex items-center gap-3 p-3 rounded-xl border border-border/80 bg-muted/30">
            <FileText className="h-5 w-5 text-destructive" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                Global Supply Agreement
              </div>
              <div className="text-xs text-muted-foreground">
                28 pages · 47 clauses
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
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

function mockReply(q: string): Msg {
  const lc = q.toLowerCase();
  if (lc.includes("payment"))
    return {
      role: "assistant",
      text: "Payment is due within **30 days** of invoice receipt. Late payments accrue interest at **1.5% per month**, compounded monthly. There is no early-payment discount.",
      refs: [{ clause: "§4 Payment Terms", page: 4 }],
      confidence: 96,
    };
  if (lc.includes("risk"))
    return {
      role: "assistant",
      text: "Three material risks were detected: (1) **Unlimited liability** on the supplier — recommend capping at contract value; (2) **2%/week penalty** for delayed delivery — aggressive vs. industry norms; (3) **1.5% monthly interest** on late payments — may violate usury caps in some jurisdictions.",
      refs: [
        { clause: "§5 Liability", page: 5 },
        { clause: "§6 Penalties", page: 6 },
      ],
      confidence: 92,
    };
  if (lc.includes("expire") || lc.includes("expir"))
    return {
      role: "assistant",
      text: "The contract expires on **July 31, 2029** — a 36-month term commencing August 1, 2026. Renewal is not automatic; either party may terminate earlier with 90 days written notice.",
      refs: [{ clause: "§7 Termination", page: 7 }],
      confidence: 98,
    };
  return {
    role: "assistant",
    text: "This is a **36-month global supply agreement** between Acme Corp (Buyer) and Northwind Ltd (Supplier) valued at $2.4M. Key terms: Net-30 payments, 90-day termination notice, 5-year confidentiality. Notable risks include unlimited supplier liability and steep delay penalties.",
    refs: [{ clause: "Executive Summary", page: 1 }],
    confidence: 89,
  };
}
