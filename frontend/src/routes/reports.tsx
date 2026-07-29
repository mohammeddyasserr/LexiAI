import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/risk-badge";
import {
  Download,
  Share2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { getReport } from "@/lib/report-api";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Executive Report — Lexis AI" },
      {
        name: "description",
        content:
          "AI-generated executive report with findings and recommendations.",
      },
    ],
  }),
  component: Reports,
});

function Reports() {
  const contractId = getContractId();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["executive-report", contractId],
    queryFn: () => getReport(contractId),
    enabled: Boolean(contractId),
  });

  const header = data?.header ?? {};
  const reportTitle = header.title ?? "Not available";
  const subtitle = header.subtitle ?? "Not available";
  const metadata = [
    header.party_1,
    header.party_2,
    header.duration,
    header.contract_value,
  ].filter(Boolean);

  const kpiCards = data?.kpi_cards ?? {};
  const executiveSummary = cleanReportText(data?.executive_summary);
  const findings = data?.key_findings?.findings ?? [];
  const clauses = data?.important_clauses?.important_clauses ?? [];
  const riskAnalysis = cleanReportText(data?.risk_analysis);
  const recommendations = parseRecommendations(data?.recommendations);

  return (
    <AppShell
      title="Executive Report"
      subtitle={subtitle}
      actions={
        <div className="flex gap-2">
          <Button variant="outline">
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button className="gradient-navy text-white hover:opacity-90">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      }
    >
      <div className="w-full max-w-[1500px] 2xl:max-w-[1700px] space-y-5">
        <Card className="p-6 border-border relative overflow-hidden bg-white/90">
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                <Sparkles className="h-3.5 w-3.5" /> AI Executive Report
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-2">
                {reportTitle}
              </h1>
              <p className="text-muted-foreground mt-2 leading-6">
                {metadata.length > 0 ? metadata.join(" · ") : "Not available"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-muted/30 p-4">
              <div className="grid grid-cols-2 gap-3">
                <Metric
                  label="Risk Score"
                  value={formatMetricValue(kpiCards.risk_score)}
                  tone="warn"
                />
                <Metric
                  label="Clauses"
                  value={formatMetricValue(kpiCards.clauses)}
                />
                <Metric
                  label="Findings"
                  value={formatMetricValue(kpiCards.findings)}
                  tone="warn"
                />
                <Metric label="Confidence" value="—" tone="ok" />
              </div>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <Card className="p-6 border-border bg-white/90">
            <p className="text-sm text-muted-foreground">
              Loading executive report…
            </p>
          </Card>
        ) : isError ? (
          <Card className="p-6 border-border bg-white/90">
            <p className="text-sm text-destructive">
              We couldn’t load the latest executive report. Please try again
              later.
            </p>
          </Card>
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <Section title="Executive Summary">
                <p className="leading-7">{executiveSummary}</p>
              </Section>

              <Section title="Key Findings">
                <div className="grid gap-3">
                  {findings.length > 0 ? (
                    findings.map((finding, index) => {
                      const isPositive =
                        finding.sentiment?.toLowerCase() === "positive";

                      return (
                        <div
                          key={`${finding.text ?? "finding"}-${index}`}
                          className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/25 p-3"
                        >
                          {isPositive ? (
                            <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                          )}
                          <span className="text-sm leading-6">
                            {finding.text ?? "Not available"}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No key findings were returned by the backend.
                    </p>
                  )}
                </div>
              </Section>
            </div>

            <Section title="Important Clauses">
              <div className="space-y-3">
                {clauses.length > 0 ? (
                  clauses.map((clause, index) => (
                    <div
                      key={`${clause.type ?? "clause"}-${index}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div>
                        <div className="text-sm font-semibold">
                          {clause.type ? `§ ${clause.type}` : "Clause"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {clause.text
                            ? truncateText(clause.text, 140)
                            : "Not available"}
                        </div>
                      </div>
                      <RiskBadge level="medium" />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No important clauses were returned by the backend.
                  </p>
                )}
              </div>
            </Section>

            <Section title="Risk Analysis">
              <p>{riskAnalysis}</p>
            </Section>

            <Section title="Recommendations">
              <div className="space-y-2">
                {recommendations.length > 0 ? (
                  recommendations.map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex items-start gap-2 rounded-lg border border-border/80 bg-muted/20 px-3 py-2.5"
                    >
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span className="text-sm leading-6">{item}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No recommendations were returned by the backend.
                  </p>
                )}
              </div>
            </Section>

            <div className="text-center text-xs text-muted-foreground pt-2 pb-6">
              Generated by Lexis AI · Contract ID: {contractId} · Not legal
              advice.
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function getContractId() {
  if (typeof window === "undefined") {
    return "CNT001";
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("contractId") ?? params.get("contract_id") ?? "CNT001";
}

function formatMetricValue(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  return String(value);
}

function cleanReportText(text: string | null | undefined) {
  if (!text) {
    return "Not available";
  }

  return text
    .replace(/```[\w-]*\s*/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .trim();
}

function parseRecommendations(text: string | null | undefined) {
  if (!text) {
    return [];
  }

  const cleaned = cleanReportText(text);
  const lines = cleaned
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const items = lines.filter(
    (line) => /^[-*•] /.test(line) || /^\d+[.)]\s/.test(line),
  );

  if (items.length > 0) {
    return items.map((line) =>
      line.replace(/^[-*•]\s*/, "").replace(/^\d+[.)]\s*/, ""),
    );
  }

  return [cleaned];
}

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}…`;
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn";
}) {
  return (
    <div>
      <div
        className={`text-2xl font-bold tabular-nums ${tone === "ok" ? "text-success" : tone === "warn" ? "text-warning-foreground" : ""}`}
      >
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground mt-0.5">
        {label}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-6 border-border bg-white/90">
      <h2 className="text-lg font-semibold tracking-tight mb-3">{title}</h2>
      <div className="text-sm leading-7 text-foreground/90 space-y-2">
        {children}
      </div>
    </Card>
  );
}
