import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
import { getRiskAnalysis } from "@/lib/risk-api";

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

const categoryMeta = [
  {
    icon: Scale,
    label: "Legal Risk",
    type: "Legal",
    color: "oklch(0.58 0.22 27)",
  },
  {
    icon: ClipboardCheck,
    label: "Compliance Risk",
    type: "Compliance",
    color: "oklch(0.78 0.16 75)",
  },
  {
    icon: AlertTriangle,
    label: "Financial Risk",
    type: "Financial",
    color: "oklch(0.58 0.22 27)",
  },
  {
    icon: Cog,
    label: "Operational Risk",
    type: "Operational",
    color: "oklch(0.65 0.16 155)",
  },
];

function Risk() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["risk-analysis", "CNT001"],
    queryFn: () => getRiskAnalysis("CNT001"),
  });

  const overallScore = data?.risk_score ?? 0;
  const findings = (data?.risks ?? []).map((item) => ({
    level: mapSeverityToLevel(item.severity),
    title: item.clause ?? "Untitled finding",
    reason:
      item.reason ?? "No additional details were supplied by the backend.",
    type: item.type ?? "General",
  }));
  const categories = categoryMeta.map((category) => {
    const matchingRisks = findings.filter(
      (finding) =>
        normalizeCategoryType(finding.type) ===
        normalizeCategoryType(category.type),
    );
    const totalWeight = matchingRisks.reduce(
      (sum, finding) => sum + severityWeight(finding.level),
      0,
    );
    const maxPossibleWeight = matchingRisks.length * 3;
    const score =
      maxPossibleWeight > 0
        ? Math.round((totalWeight / maxPossibleWeight) * 100)
        : 0;

    return { ...category, score };
  });

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
          {isLoading ? (
            <div className="mt-4 text-sm text-muted-foreground">
              Loading risk analysis…
            </div>
          ) : isError ? (
            <div className="mt-4 text-sm text-destructive">
              We couldn’t load the latest risk analysis. Please try again later.
            </div>
          ) : (
            <>
              <RiskGauge value={overallScore} />
              <div className="text-sm font-semibold mt-3">
                {getRiskLabel(overallScore)}
              </div>
              <p className="text-xs text-muted-foreground mt-2 max-w-xs">
                {findings.length > 0
                  ? "The latest backend analysis is now displayed below."
                  : "No findings were returned by the backend for this contract."}
              </p>
            </>
          )}
          <div className="grid grid-cols-3 w-full mt-6 pt-6 border-t border-border">
            <div>
              <div className="text-2xl font-bold text-destructive">
                {
                  findings.filter(
                    (f) => f.level === "high" || f.level === "critical",
                  ).length
                }
              </div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                High
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning-foreground">
                {findings.filter((f) => f.level === "medium").length}
              </div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                Medium
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">
                {findings.filter((f) => f.level === "low").length}
              </div>
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
          {isLoading ? (
            <Card className="p-5 border-border bg-white/90">
              <p className="text-sm text-muted-foreground">Loading findings…</p>
            </Card>
          ) : isError ? (
            <Card className="p-5 border-border bg-white/90">
              <p className="text-sm text-destructive">
                Risk findings could not be loaded from the backend.
              </p>
            </Card>
          ) : findings.length > 0 ? (
            findings.map((f, i) => (
              <Card
                key={`${f.title}-${i}`}
                className="p-5 border-border hover:shadow-md transition-shadow bg-white/90"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
                    <ShieldAlert className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <h4 className="font-semibold">{f.title}</h4>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mt-1">
                          {f.type}
                        </div>
                      </div>
                      <RiskBadge level={f.level} />
                    </div>
                    <div className="mt-3">
                      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Reason
                      </div>
                      <p className="text-sm">{f.reason}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-5 border-border bg-white/90">
              <p className="text-sm text-muted-foreground">
                No findings were returned for this contract.
              </p>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function normalizeCategoryType(type?: string) {
  return (type ?? "").trim().toLowerCase();
}

function severityWeight(level: "low" | "medium" | "high" | "critical") {
  switch (level) {
    case "high":
    case "critical":
      return 3;
    case "medium":
      return 2;
    default:
      return 1;
  }
}

function mapSeverityToLevel(
  severity?: string,
): "low" | "medium" | "high" | "critical" {
  const normalized = severity?.toLowerCase() ?? "";

  if (normalized.includes("critical")) return "critical";
  if (normalized.includes("high")) return "high";
  if (normalized.includes("medium")) return "medium";
  return "low";
}

function getRiskLabel(score: number) {
  if (score >= 75) return "High Risk";
  if (score >= 45) return "Medium Risk";
  return "Low Risk";
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
