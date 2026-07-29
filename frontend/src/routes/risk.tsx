import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { RiskBadge } from "@/components/risk-badge";
import {
  AlertTriangle,
  ShieldAlert,
  Scale,
  ClipboardCheck,
  Cog,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/risk")({
  head: () => ({
    meta: [
      { title: "Risk Analysis — Lexis AI" },
      {
        name: "description",
        content: "Overall risk scoring and category-level breakdown.",
      },
    ],
  }),
  component: Risk,
});

const categories = [
  { icon: Scale, label: "Legal Risk", score: 78, color: "oklch(0.58 0.22 27)" },
  {
    icon: ClipboardCheck,
    label: "Compliance Risk",
    score: 45,
    color: "oklch(0.78 0.16 75)",
  },
  {
    icon: AlertTriangle,
    label: "Financial Risk",
    score: 82,
    color: "oklch(0.58 0.22 27)",
  },
  {
    icon: Cog,
    label: "Operational Risk",
    score: 38,
    color: "oklch(0.65 0.16 155)",
  },
];

const findings = [
  {
    level: "critical" as const,
    title: "Unlimited Liability Clause",
    reason:
      "The supplier accepts unlimited responsibility for all direct and indirect damages, with no cap on financial exposure.",
    recommendation:
      "Cap liability at the total contract value ($2.4M) and explicitly exclude indirect, consequential, and punitive damages.",
  },
  {
    level: "high" as const,
    title: "Aggressive Penalty Terms",
    reason:
      "Delay penalties of 2% per week of contract value are 3× above industry median (0.5-1%).",
    recommendation:
      "Negotiate down to 0.75%/week with a 10% total cap and add force-majeure carve-outs.",
  },
  {
    level: "medium" as const,
    title: "High Late-Payment Interest",
    reason:
      "1.5% monthly interest may exceed statutory limits in EU jurisdictions (max ~8% p.a.).",
    recommendation: "Align to statutory rate + 2% margin, jurisdiction-tested.",
  },
  {
    level: "low" as const,
    title: "Confidentiality Term",
    reason: "5-year confidentiality is within industry norms.",
    recommendation: "No change required.",
  },
];

function Risk() {
  const overallScore = 72;
  return (
    <AppShell
      title="Risk Analysis"
      subtitle="Global Supply Agreement — Acme Corp"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Overall */}
        <Card className="lg:col-span-1 p-6 border-border flex flex-col items-center text-center bg-white/90">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Overall Risk Score
          </div>
          <RiskGauge value={overallScore} />
          <div className="text-sm font-semibold mt-3">Medium-High Risk</div>
          <p className="text-xs text-muted-foreground mt-2 max-w-xs">
            Multiple material clauses require negotiation before signing.
          </p>
          <div className="grid grid-cols-3 w-full mt-6 pt-6 border-t border-border">
            <div>
              <div className="text-2xl font-bold text-destructive">3</div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                High
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning-foreground">
                7
              </div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                Medium
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">37</div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                Low
              </div>
            </div>
          </div>
        </Card>

        {/* Categories */}
        <Card className="lg:col-span-2 p-6 border-border bg-white/90">
          <h3 className="font-semibold tracking-tight">Risk Categories</h3>
          <p className="text-xs text-muted-foreground mb-6">
            Breakdown by domain
          </p>
          <div className="space-y-5">
            {categories.map((c) => (
              <div key={c.label}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center">
                    <c.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{c.label}</div>
                  </div>
                  <div
                    className="text-lg font-bold tabular-nums"
                    style={{ color: c.color }}
                  >
                    {c.score}
                  </div>
                </div>
                <Progress value={c.score} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* Findings */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="font-semibold tracking-tight text-lg">
            Detected Findings
          </h3>
          {findings.map((f, i) => (
            <Card
              key={i}
              className="p-5 border-border hover:shadow-md transition-shadow bg-white/90"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h4 className="font-semibold">{f.title}</h4>
                    <RiskBadge level={f.level} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Reason
                      </div>
                      <p className="text-sm">{f.reason}</p>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-accent uppercase tracking-wide mb-1">
                        Recommendation
                      </div>
                      <p className="text-sm">{f.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function RiskGauge({ value }: { value: number }) {
  const size = 200;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const color =
    value > 70
      ? "oklch(0.58 0.22 27)"
      : value > 40
        ? "oklch(0.78 0.16 75)"
        : "oklch(0.65 0.16 155)";
  return (
    <div className="relative mt-4" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="oklch(0.92 0.01 255)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-bold tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground">/ 100</div>
      </div>
    </div>
  );
}
