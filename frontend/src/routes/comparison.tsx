import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/risk-badge";
import { Upload, FileText, Check, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/comparison")({
  head: () => ({
    meta: [
      { title: "Contract Comparison — Lexis AI" },
      {
        name: "description",
        content: "Compare two contracts side by side with AI recommendations.",
      },
    ],
  }),
  component: Comparison,
});

const rows = [
  {
    feature: "Payment Terms",
    a: "Net 30, 1.5%/mo interest",
    b: "Net 45, 1.0%/mo interest",
    winner: "b",
  },
  {
    feature: "Contract Duration",
    a: "36 months",
    b: "24 months + 12mo option",
    winner: "b",
  },
  {
    feature: "Penalty Clause",
    a: "2%/week, cap 20%",
    b: "0.5%/week, cap 10%",
    winner: "b",
  },
  { feature: "Warranty", a: "12 months", b: "24 months", winner: "b" },
  { feature: "Termination Notice", a: "90 days", b: "60 days", winner: "a" },
  {
    feature: "Liability Cap",
    a: "Unlimited",
    b: "Contract value",
    winner: "b",
  },
];

function Comparison() {
  return (
    <AppShell
      title="Contract Comparison"
      subtitle="Side-by-side analysis with AI recommendations"
    >
      {/* Uploads */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {[
          {
            label: "Contract A",
            name: "Global_Supply_Agreement_v3.pdf",
            risk: "high" as const,
          },
          {
            label: "Contract B",
            name: "Northwind_Proposal_v2.pdf",
            risk: "medium" as const,
          },
        ].map((c, i) => (
          <Card
            key={i}
            className="p-5 border-border flex items-center gap-4 bg-white/90"
          >
            <div
              className={cn(
                "h-12 w-12 rounded-lg flex items-center justify-center shrink-0",
                i === 0
                  ? "bg-primary/10 text-primary"
                  : "bg-accent/10 text-accent",
              )}
            >
              <FileText className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">{c.label}</div>
              <div className="font-semibold truncate">{c.name}</div>
              <div className="mt-1">
                <RiskBadge level={c.risk} />
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Upload className="h-3.5 w-3.5" /> Replace
            </Button>
          </Card>
        ))}
      </div>

      {/* Recommendation */}
      <Card className="p-6 border-border mb-6 relative overflow-hidden bg-white/90">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="relative flex items-start gap-4">
          <div className="h-11 w-11 rounded-xl gradient-ai flex items-center justify-center shadow-md shrink-0">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold text-accent uppercase tracking-widest">
              AI Recommendation
            </div>
            <h3 className="text-xl font-bold tracking-tight mt-1">
              Contract B is the better option
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-3xl">
              Northwind's proposal offers a capped liability, longer warranty,
              and materially lower penalty exposure — projected savings of{" "}
              <strong className="text-foreground">$180K over 24 months</strong>.
              The only trade-off is a shorter termination-notice window.
            </p>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="border-border overflow-hidden bg-white/90">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_auto] items-center px-5 py-3 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <div>Feature</div>
          <div>Contract A</div>
          <div>Contract B</div>
          <div className="text-center w-20">Winner</div>
        </div>
        {rows.map((r) => (
          <div
            key={r.feature}
            className="grid grid-cols-[1.4fr_1fr_1fr_auto] items-center px-5 py-4 border-b border-border last:border-b-0 hover:bg-muted/20"
          >
            <div className="text-sm font-medium">{r.feature}</div>
            <div
              className={cn(
                "text-sm",
                r.winner === "a" && "font-semibold text-success",
              )}
            >
              {r.a}
            </div>
            <div
              className={cn(
                "text-sm",
                r.winner === "b" && "font-semibold text-success",
              )}
            >
              {r.b}
            </div>
            <div className="w-20 flex justify-center">
              {r.winner === "a" ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  <Check className="h-3.5 w-3.5" /> A
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  <Check className="h-3.5 w-3.5" /> B
                </span>
              )}
            </div>
          </div>
        ))}
      </Card>

      {/* Risk comparison */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {[
          {
            label: "Contract A · Risk Profile",
            score: 72,
            breakdown: [
              ["Legal", 78],
              ["Financial", 82],
              ["Compliance", 45],
              ["Operational", 38],
            ],
          },
          {
            label: "Contract B · Risk Profile",
            score: 42,
            breakdown: [
              ["Legal", 40],
              ["Financial", 45],
              ["Compliance", 38],
              ["Operational", 35],
            ],
          },
        ].map((c, i) => (
          <Card key={i} className="p-5 border-border bg-white/90">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{c.label}</h3>
              <div
                className={cn(
                  "text-3xl font-bold tabular-nums",
                  c.score > 60 ? "text-destructive" : "text-success",
                )}
              >
                {c.score}
              </div>
            </div>
            <div className="space-y-2 mt-4">
              {c.breakdown.map(([label, v]) => (
                <div key={label as string}>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold">{v}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${v}%`,
                        background:
                          (v as number) > 60
                            ? "oklch(0.58 0.22 27)"
                            : (v as number) > 40
                              ? "oklch(0.78 0.16 75)"
                              : "oklch(0.65 0.16 155)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
