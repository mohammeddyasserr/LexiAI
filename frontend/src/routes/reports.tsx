import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useMemo } from "react";
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
import {
  AlertTriangle,
  ShieldAlert,
  Scale,
  ClipboardCheck,
  Cog,
} from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { getReport } from "@/lib/report-api";
import { ContractSelector } from "@/components/contract-selector";

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
  const location = useLocation();
  const contractId = useMemo(
    () => getContractId(location.search),
    [location.search],
  );
  const { data, isLoading, isError } = useQuery({
    queryKey: ["executive-report", contractId],
    queryFn: () => getReport(contractId ?? ""),
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
  const riskScoreNumeric = toNumeric(kpiCards.risk_score);
  const riskScoreLabel =
    riskScoreNumeric === null ? "Not available" : riskLevelLabel(riskScoreNumeric);

  const executiveSummarySections = parseSummarySections(
  data?.executive_summary
);
  const findings = data?.key_findings?.findings ?? [];
  const clauses = data?.important_clauses?.important_clauses ?? [];

  const handleDownloadPdf = () => {
    const summaryHtml =
      executiveSummarySections.length > 0
        ? executiveSummarySections.map((section) => {
            const content = renderMarkdownHtml(section.content ?? "");
            return `
          <section class="card">
            <h3>${escapeHtml(section.title ?? "Summary")}</h3>
            <div>${content}</div>
          </section>`;
            })
            .join("")
        : renderMarkdownHtml(data?.executive_summary);

    const findingsHtml = findings
      .map(
        (finding) => `
          <li>${escapeHtml(finding.text ?? "Not available")}</li>`,
      )
      .join("");

    const riskAnalysisHtml = renderMarkdownHtml(data?.risk_analysis);
    const recommendationsHtml = renderMarkdownHtml(data?.recommendations);

    const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; color: #111827; margin: 0; padding: 32px; line-height: 1.6; }
            h1, h2, h3 { color: #0f172a; margin-bottom: 8px; }
            .hero { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; }
            .meta { color: #475569; margin-top: 6px; }
            .grid { display: grid; gap: 16px; }
            .card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-bottom: 12px; page-break-inside: avoid; }
            ul { padding-left: 20px; }
            li { margin-bottom: 6px; }
            strong { color: #0f172a; }
          </style>
        </head>
        <body>
          <div class="hero">
            <h1>${escapeHtml(reportTitle)}</h1>
            <div class="meta">${escapeHtml(metadata.join(" · ") || "Not available")}</div>
          </div>
          <div class="grid">
            <section class="card">
              <h2>Executive Summary</h2>
              ${summaryHtml || "<p>No executive summary available.</p>"}
            </section>
            <section class="card">
              <h2>Key Findings</h2>
              <ul>${findingsHtml || "<li>No findings available.</li>"}</ul>
            </section>
            <section class="card">
              <h2>Risk Analysis</h2>
              ${riskAnalysisHtml}
            </section>
            <section class="card">
              <h2>Recommendations</h2>
              ${recommendationsHtml}
            </section>
          </div>
        </body>
      </html>`;

    const printWindow = window.open("", "_blank", "width=900,height=1200");

    if (!printWindow) {
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => printWindow.print(), 250);
  };

  return (
    <AppShell
      title="Executive Report"
      subtitle={subtitle}
      actions={
        <div className="flex gap-2">
          <Button variant="outline">
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button
            className="gradient-navy text-white hover:opacity-90"
            onClick={handleDownloadPdf}
            type="button"
          >
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      }
    >
      <div className="w-full max-w-[1500px] 2xl:max-w-[1700px] space-y-5">
        <ContractSelector className="max-w-xl" />

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
              <div className="flex items-center gap-4">
                <RiskGauge value={riskScoreNumeric} />
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Risk Score
                  </div>
                  <div className="text-sm font-semibold mt-0.5">
                    {riskScoreLabel}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                    {riskScoreNumeric === null ? "—" : `${riskScoreNumeric} / 100`}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border/60 pt-4">
                <Metric label="Clauses" value={formatMetricValue(kpiCards.clauses)} />
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
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Loading executive report…
              </p>
            </div>
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
                {executiveSummarySections.length > 0 ? (
                  <div className="space-y-3">
                    {executiveSummarySections.map((section, index) => (
                      <div
                        key={`${section.title ?? "summary"}-${index}`}
                        className="rounded-xl border border-border/80 bg-muted/20 p-3 transition-colors hover:bg-muted/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-sm font-semibold">
                            {section.title ?? "Clause"}
                          </div>
                          <div className="text-xs text-muted-foreground shrink-0">
                            Page {section.page_no ?? "—"}
                          </div>
                        </div>
                        <div className="mt-2 space-y-2 text-[13px] leading-6 text-foreground/90">
                          {renderMarkdownContent(section.content)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[13px] leading-6 space-y-2">
                    {renderMarkdownContent(data?.executive_summary)}
                  </div>
                )}
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
                          className={`flex items-start gap-3 rounded-xl border-l-4 border border-border/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
                            isPositive ? "border-l-success" : "border-l-destructive"
                          }`}
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
                    <ClauseCard
                      key={`${clause.title ?? "clause"}-${index}`}
                      clause={clause}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No important clauses were returned by the backend.
                  </p>
                )}
              </div>
            </Section>

            <Section title="Risk Analysis">
              <div className="flex items-center gap-2">
                <ShieldAlert
                  className={`h-5 w-5 ${riskLevelColorClass(riskScoreNumeric ?? 0)}`}
                />
                <h3 className="text-base font-semibold">
                  Overall Risk Score:{" "}
                  <span className={riskLevelColorClass(riskScoreNumeric ?? 0)}>
                    {riskScoreNumeric === null ? "Not available" : riskScoreLabel}
                  </span>
                </h3>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <Progress value={riskScoreNumeric ?? 0} className="h-2 flex-1" />
                <span className="w-14 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
                  {riskScoreNumeric === null ? "—" : `${Math.round(riskScoreNumeric)}/100`}
                </span>
              </div>

              <div className="mt-4 text-[13px] leading-6 space-y-2">
                {renderMarkdownContent(data?.risk_analysis)}
              </div>
            </Section>

            <Section title="Recommendations">
              <div className="text-[13px] leading-6 space-y-2">
                {renderMarkdownContent(data?.recommendations)}
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

function formatMetricValue(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  return String(value);
}

function toNumeric(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function riskLevelLabel(score: number) {
  if (score >= 70) return "High Risk";
  if (score >= 40) return "Medium Risk";
  return "Low Risk";
}

function riskLevelColorClass(score: number) {
  if (score >= 70) return "text-destructive";
  if (score >= 40) return "text-warning-foreground";
  return "text-success";
}

function stripMarkdownCodeFences(text: string | null | undefined) {
  if (!text) {
    return "";
  }

  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json|markdown|md)?\s*([\s\S]*?)\s*```$/i);

  return match ? match[1].trim() : trimmed;
}

function parseSafeJson<T>(text: string | null | undefined): T | null {
  if (!text) {
    return null;
  }

  const normalized = stripMarkdownCodeFences(text).trim();

  if (!normalized) {
    return null;
  }

  try {
    return JSON.parse(normalized) as T;
  } catch {
    return null;
  }
}

function cleanDisplayText(text: string | null | undefined) {
  if (!text) {
    return "Not available";
  }

  let value = text
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
      const codePoint = Number.parseInt(hex, 16);
      return String.fromCharCode(codePoint);
    })
    .replace(/\\n/g, "\n")
    .replace(/\r/g, "");

  value = value.replace(/[ \t]+\n/g, "\n");
  value = value.replace(/\n{3,}/g, "\n\n");
  // إزالة البادئة -3-
  value = value.replace(/^-?\d+-\s*/g, "");

  // كل بند (a) أو (b) يبدأ سطر جديد
  value = value.replace(/\s+\(([a-z])\)/g, "\n($1) ");

  // لو فيه (i) أو (ii) أو (iii)
  value = value.replace(
    /\s+\(((?:i|ii|iii|iv|v|vi|vii|viii|ix|x))\)/gi,
    "\n($1) ",
  );

  // تحسين المسافات
  value = value.replace(/\s{2,}/g, " ");
  // سطر جديد بعد عنوان البند الرئيسي
  value = value.replace(
    /(REPRESENTATIONS AND WARRANTIES\s+5\.1)/i,
    "REPRESENTATIONS AND WARRANTIES\n\n5.1",
  );

  // سطر قبل كلمة "during the Term..."
  value = value.replace(/(during the Term of this Agreement:)/i, "$1\n");

  const lines = value
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  return lines.join("\n") || "Not available";
}

function cleanReportText(text: string | null | undefined) {
  if (!text) {
    return "Not available";
  }

  return cleanDisplayText(stripMarkdownCodeFences(text));
}

function parseExecutiveSummary(text: string | null | undefined) {
  const parsed = parseSafeJson<{
    contract_content?: Array<{
      type?: string;
      text?: string;
      page_no?: number | null;
    }>;
  }>(text);

  if (!parsed?.contract_content?.length) {
    return [];
  }

  return parsed.contract_content
    .filter((item) => item && (item.type || item.text))
    .map((item) => ({
      type: item.type ?? "Clause",
      text: item.text ?? "Not available",
      page_no: item.page_no ?? null,
    }));
}

function renderMarkdownContent(markdown: string | null | undefined) {
  const content = normalizeMarkdownContent(markdown);

  if (!content) {
    return (
      <p className="text-sm leading-7 text-muted-foreground">Not available</p>
    );
  }

  const lines = content.split(/\n/);
  const blocks: React.ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (/^#{1,6}\s+/.test(line)) {
      const level = Math.min(3, line.match(/^#+/)?.[0].length ?? 1);
      const headingText = line.replace(/^#{1,6}\s+/, "");
      const headingClass =
        [
          "text-sm font-semibold",
          "text-[13px] font-semibold",
          "text-[13px] font-medium",
        ][level - 1] ?? "text-sm font-semibold";
      const Icon = headingIcon(headingText);
      blocks.push(
        <div
          key={`heading-${index}`}
          className={`${headingClass} mt-3 first:mt-0 flex items-center gap-1.5`}
        >
          {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 text-accent" /> : null}
          {renderInlineMarkdown(headingText)}
        </div>,
      );
      index += 1;
      continue;
    }

    if (/^[-*•]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*•]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*•]\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ul key={`list-${index}`} className="ml-4 list-disc space-y-1.5">
          {items.map((item, itemIndex) => (
            <li
              key={`${item}-${itemIndex}`}
              className="text-[13px] leading-6 text-foreground/90"
            >
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const start = Number(line.match(/^(\d+)\./)?.[1] ?? 1);
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ol
          key={`ordered-${index}`}
          start={start}
          className="ml-4 list-decimal space-y-1.5"
        >
          {items.map((item, itemIndex) => (
            <li
              key={`${item}-${itemIndex}`}
              className="text-[13px] leading-6 text-foreground/90"
            >
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^#{1,6}\s+/.test(lines[index].trim()) &&
      !/^[-*•]\s+/.test(lines[index].trim()) &&
      !/^\d+\.\s+/.test(lines[index].trim())
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    const paragraph = paragraphLines.join(" ");
    if (paragraph) {
      blocks.push(
        <p
          key={`paragraph-${index}`}
          className="text-[13px] leading-6 text-foreground/90"
        >
          {renderInlineMarkdown(paragraph)}
        </p>,
      );
    }
  }

  return <>{blocks}</>;
}

function normalizeMarkdownContent(text: string | null | undefined) {
  const content = stripMarkdownCodeFences(text);

  if (!content) {
    return "";
  }

  // Some backend responses arrive as one long run-on line where headers,
  // numbered items, and sub-bullets are separated by spaces instead of real
  // line breaks (e.g. "#### Legal Risks: 1. **Clause:** - **Risk Score:** ...").
  // Insert line breaks before those markers wherever they appear so the
  // block parser below can pick them up as headings/lists.
  return cleanDisplayText(content)
    .replace(/\s*(#{1,6}\s+)/g, "\n$1")
    .replace(/\s+(\d+\.\s+\*\*)/g, "\n$1")
    .replace(/\s+(-\s+\*\*)/g, "\n$1")
    .trim();
}

function renderMarkdownHtml(text: string | null | undefined) {
  const content = normalizeMarkdownContent(text);

  if (!content) {
    return "<p>Not available</p>";
  }

  const lines = content.split(/\n/);
  const sections: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (/^#{1,6}\s+/.test(line)) {
      const level = Math.min(3, line.match(/^#+/)?.[0].length ?? 1);
      const heading = line.replace(/^#{1,6}\s+/, "");
      const headingTag = `h${Math.min(3, level)}`;
      sections.push(`<${headingTag}>${escapeHtml(heading)}</${headingTag}>`);
      index += 1;
      continue;
    }

    if (/^[-*•]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*•]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*•]\s+/, ""));
        index += 1;
      }
      sections.push(
        `<ul>${items.map((item) => `<li>${renderInlineMarkdownHtml(item)}</li>`).join("")}</ul>`,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const start = line.match(/^(\d+)\./)?.[1] ?? "1";
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      sections.push(
        `<ol start="${start}">${items.map((item) => `<li>${renderInlineMarkdownHtml(item)}</li>`).join("")}</ol>`,
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^#{1,6}\s+/.test(lines[index].trim()) &&
      !/^[-*•]\s+/.test(lines[index].trim()) &&
      !/^\d+\.\s+/.test(lines[index].trim())
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    const paragraph = paragraphLines.join(" ");

    if (paragraph) {
      sections.push(`<p>${renderInlineMarkdownHtml(paragraph)}</p>`);
    }
  }

  return sections.join("");
}

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);

  return (
    <>
      {parts.map((part, index) => {
        if (/^\*\*.+\*\*$/.test(part)) {
          return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
        }

        if (/^\*.+\*$/.test(part)) {
          return <em key={`${part}-${index}`}>{part.slice(1, -1)}</em>;
        }

        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
}

function renderInlineMarkdownHtml(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);

  return parts
    .map((part) => {
      if (/^\*\*.+\*\*$/.test(part)) {
        return `<strong>${escapeHtml(part.slice(2, -2))}</strong>`;
      }

      if (/^\*.+\*$/.test(part)) {
        return `<em>${escapeHtml(part.slice(1, -1))}</em>`;
      }

      return escapeHtml(part);
    })
    .join("");
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Compact circular gauge used as the report's signature visual for the risk score. */
function RiskGauge({ value }: { value: number | null }) {
  const score = value === null ? null : Math.min(100, Math.max(0, value));
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset =
    score === null ? circumference : circumference - (score / 100) * circumference;
  const colorClass = score === null ? "text-muted-foreground" : riskLevelColorClass(score);

  return (
    <div className={`relative flex h-16 w-16 shrink-0 items-center justify-center ${colorClass}`}>
      <svg viewBox="0 0 72 72" className="h-16 w-16 -rotate-90">
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeWidth="7"
        />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-sm font-bold tabular-nums text-foreground">
        {score === null ? "—" : score}
      </span>
    </div>
  );
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
        className={`text-xl font-bold tabular-nums ${tone === "ok" ? "text-success" : tone === "warn" ? "text-warning-foreground" : ""}`}
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
      <div className="flex items-center gap-2 mb-3">
        <span className="h-4 w-1 rounded-full bg-accent" />
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="text-sm leading-7 text-foreground/90 space-y-2">
        {children}
      </div>
    </Card>
  );
}

function formatContractSummary(text?: string) {
  if (!text) return "Not available";

  let cleaned = cleanDisplayText(text)
    .replace(/^\-3-\s*/i, "")
    .replace(/^\d+\.\d+\s*/, "")
    .trim();

  const sentences = cleaned
    .split(/[.;;]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    sentences
      .slice(0, 3)
      .map((s) => (s.length > 180 ? s.slice(0, 180) + "..." : s))
      .join(". ") + "."
  );
}

function ClauseCard({
  clause,
}: {
  clause: { title?: string; description?: string; priority?: string };
}) {
  function mapSeverityToLevel(
  severity?: unknown,
): "low" | "medium" | "high" | "critical" {
  const value = String(severity ?? "").toLowerCase();

  if (value.includes("critical")) return "critical";

  if (value.includes("high")) return "high";

  if (value.includes("medium")) return "medium";

  return "low";
}
  const level = mapSeverityToLevel(clause.priority);
  const accentClass =
    level === "critical" || level === "high"
      ? "border-l-destructive"
      : level === "medium"
        ? "border-l-warning-foreground"
        : "border-l-success";
  return (
    <div
      className={`rounded-xl border border-l-4 ${accentClass} border-border/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold">{clause.title ?? "Clause"}</h3>
        <RiskBadge level={level} />
      </div>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {clause.description ?? "Not available"}
      </p>
    </div>
  );
}

/** Picks a small icon for a markdown heading based on its wording (Legal Risks, Financial Risks, etc). */
function headingIcon(text: string) {
  const value = text.toLowerCase();
  if (value.includes("legal")) return Scale;
  if (value.includes("compliance")) return ClipboardCheck;
  if (value.includes("financial")) return AlertTriangle;
  if (value.includes("operational")) return Cog;
  if (value.includes("recommendation")) return CheckCircle2;
  if (value.includes("summary") || value.includes("risk assessment")) return ShieldAlert;
  if (value.includes("other")) return AlertCircle;
  return null;
}

function mapSeverityToLevel(
  severity?: string,
): "low" | "medium" | "high" | "critical" {
  const value = severity?.toLowerCase() ?? "";

  if (value.includes("critical")) return "critical";

  if (value.includes("high")) return "high";

  if (value.includes("medium")) return "medium";

  return "low";
}

function parseSummarySections(text: string | null | undefined) {
  if (!text) return [];

  const cleaned = text.replace("### Analysis of the Contract", "").trim();

  const sections = cleaned.split(/#### /).filter(Boolean);

  return sections.map((section) => {
    const [title, ...content] = section.split("\n");

    return {
      title: title.replace(":", "").trim(),
      content: content.join("\n").trim(),
    };
  });
}