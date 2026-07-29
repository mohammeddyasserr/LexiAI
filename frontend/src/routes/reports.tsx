import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
  const executiveSummaryItems = parseExecutiveSummary(data?.executive_summary);
  const executiveSummaryFallback = cleanReportText(data?.executive_summary);
  const riskAnalysis = parseRiskAnalysis(data?.risk_analysis ?? undefined);
  const findings = data?.key_findings?.findings ?? [];
  const clauses = data?.important_clauses?.important_clauses ?? [];
  const recommendations = parseRecommendations(data?.recommendations);

  const handleDownloadPdf = () => {
    const summaryHtml = executiveSummaryItems
      .map((item) => {
        const content = renderMarkdownHtml(item.text ?? "");
        return `
          <section class="card">
            <h3>${escapeHtml(item.type ?? "Summary")}</h3>
            <div>${content}</div>
          </section>`;
      })
      .join("");

    const findingsHtml = findings
      .map(
        (finding) => `
          <li>${escapeHtml(finding.text ?? "Not available")}</li>`,
      )
      .join("");

    const recommendationsHtml = recommendations
      .map(
        (item) => `
          <li>
            <strong>${escapeHtml(item.type ?? "Recommendation")}</strong>
            <div>${escapeHtml(item.text ?? "No details available")}</div>
          </li>`,
      )
      .join("");

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
            .card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-bottom: 12px; }
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
              <h2>Recommendations</h2>
              <ul>${recommendationsHtml || "<li>No recommendations available.</li>"}</ul>
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
                {executiveSummaryItems.length > 0 ? (
                  <div className="space-y-3">
                    {executiveSummaryItems.map((item, index) => (
                      <div
                        key={`${item.type ?? "summary"}-${index}`}
                        className="rounded-xl border border-border/80 bg-muted/20 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-sm font-semibold">
                            {item.type ?? "Clause"}
                          </div>
                          <div className="text-xs text-muted-foreground shrink-0">
                            Page {item.page_no ?? "—"}
                          </div>
                        </div>
                        <div className="mt-2 space-y-2 text-sm leading-6 text-foreground/90">
                          {renderMarkdownContent(item.text)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="leading-7">{executiveSummaryFallback}</p>
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
                          className="flex items-start gap-3 rounded-xl border border-border/80 bg-white p-4 shadow-sm"
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
                      key={`${clause.type ?? "clause"}-${index}`}
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
              <RiskAnalysis score={kpiCards.risk_score} risk={riskAnalysis} />
            </Section>

            <Section title="Recommendations">
              <div className="space-y-4">
                {recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {recommendations.map((item, index) => (
                      <div
                        key={`${item.type ?? "recommendation"}-${index}`}
                        className="rounded-xl border border-border/80 bg-muted/20 p-4"
                      >
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold">
                              {item.type ?? "Recommendation"}
                            </div>
                            {item.page_no ? (
                              <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                                Page {item.page_no}
                              </div>
                            ) : null}
                            <div className="mt-2 text-sm leading-6 text-foreground/90">
                              {renderMarkdownContent(item.text)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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

function parseRiskAnalysis(text?: string) {
  if (!text) {
    return {
      categories: [],
      primarySources: null,
      businessImpact: null,
      assessment: null,
    };
  }

  const categories = [];
  const primarySources =
    text.match(
      /\*\*Primary Sources of Risk:\*\*\n\n([\s\S]*?)(?=\n\n\*\*)/,
    )?.[1] ?? null;

  const businessImpact =
    text.match(
      /\*\*Potential Business Impact:\*\*\n\n([\s\S]*?)(?=\n\n\*\*)/,
    )?.[1] ?? null;

  const assessment =
    text.match(/\*\*Overall Risk Assessment:\*\*\n\n([\s\S]*)/)?.[1] ?? null;

  const legal = text.match(
    /- \*\*Legal Obligations \(\d+\):\*\*([\s\S]*?)(?=\n\n- \*\*|\n\n\*\*)/,
  );

  if (legal) {
    categories.push({
      name: "Legal Risk",
      details: legal[1].split("\n").filter(Boolean),
    });
  }

  const operational = text.match(
    /- \*\*Operational Risk \(\d+\):\*\*([\s\S]*?)(?=\n\n\*\*)/,
  );

  if (operational) {
    categories.push({
      name: "Operational Risk",
      details: operational[1].split("\n").filter(Boolean),
    });
  }

  return {
    categories,
    primarySources,
    businessImpact,
    assessment,
  };
}

function parseRecommendations(text: string | null | undefined) {
  if (!text) {
    return [];
  }

  const cleaned = stripMarkdownCodeFences(text).trim();

  const parsed = parseSafeJson<
    | Array<
        | string
        | {
            type?: string;
            text?: string;
            page_no?: number | null;
            "page no."?: number | null;
          }
      >
    | Record<string, unknown>
  >(cleaned);

  if (parsed) {
    const items: Array<{
      type?: string;
      text?: string;
      page_no?: number | null;
    }> = [];

    if (Array.isArray(parsed)) {
      parsed.forEach((item) => {
        if (typeof item === "string") {
          items.push({ text: item });
          return;
        }

        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          items.push({
            type: typeof record.type === "string" ? record.type : undefined,
            text:
              typeof record.text === "string"
                ? record.text
                : typeof record.summary === "string"
                  ? record.summary
                  : undefined,
            page_no:
              typeof record.page_no === "number"
                ? record.page_no
                : typeof record["page no."] === "number"
                  ? record["page no."]
                  : null,
          });
        }
      });
    } else if (typeof parsed === "object") {
      Object.values(parsed).forEach((value) => {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (typeof item === "string") {
              items.push({ text: item });
              return;
            }

            if (item && typeof item === "object") {
              const record = item as Record<string, unknown>;
              items.push({
                type: typeof record.type === "string" ? record.type : undefined,
                text:
                  typeof record.text === "string"
                    ? record.text
                    : typeof record.summary === "string"
                      ? record.summary
                      : undefined,
                page_no:
                  typeof record.page_no === "number"
                    ? record.page_no
                    : typeof record["page no."] === "number"
                      ? record["page no."]
                      : null,
              });
            }
          });
        }
      });
    }

    if (items.length > 0) {
      return items.filter((item) => item.text || item.type);
    }
  }

  const lines = cleaned
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const items = lines.filter(
    (line) => /^[-*•] /.test(line) || /^\d+[.)]\s/.test(line),
  );

  if (items.length > 0) {
    return items.map((line) => ({
      text: cleanDisplayText(
        line.replace(/^[-*•]\s*/, "").replace(/^\d+[.)]\s*/, ""),
      ),
    }));
  }

  return [{ text: cleanReportText(text) }];
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
          "text-base font-semibold",
          "text-sm font-semibold",
          "text-sm font-medium",
        ][level - 1] ?? "text-sm font-semibold";
      blocks.push(
        <div key={`heading-${index}`} className={`${headingClass} mt-1`}>
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
        <ul key={`list-${index}`} className="ml-4 list-disc space-y-2">
          {items.map((item, itemIndex) => (
            <li
              key={`${item}-${itemIndex}`}
              className="text-sm leading-7 text-foreground/90"
            >
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ol key={`ordered-${index}`} className="ml-4 list-decimal space-y-2">
          {items.map((item, itemIndex) => (
            <li
              key={`${item}-${itemIndex}`}
              className="text-sm leading-7 text-foreground/90"
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
          className="text-sm leading-7 text-foreground/90"
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

  return cleanDisplayText(content)
    .replace(/\*\*(.*?)\*\*/g, "**$1**")
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
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      sections.push(
        `<ol>${items.map((item) => `<li>${renderInlineMarkdownHtml(item)}</li>`).join("")}</ol>`,
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

function formatContractSummary(text?: string) {
  if (!text) return "Not available";

  let cleaned = cleanDisplayText(text)
    .replace(/^\-3-\s*/i, "")
    .replace(/^\d+\.\d+\s*/, "")
    .trim();

  const sentences = cleaned
    .split(/[.;;]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    sentences
      .slice(0, 3)
      .map((s) => (s.length > 180 ? s.slice(0, 180) + "..." : s))
      .join(". ") + "."
  );
}

function createClauseSummary(type?: string) {
  const summaries: Record<string, string> = {
    Delivery:
      "Defines CEIS obligations related to content rights, delivery accuracy, legal compliance, and ownership warranties.",

    Liability:
      "Contains indemnification obligations that may create financial exposure for the responsible party.",

    Termination:
      "Defines termination conditions and potential consequences of ending the agreement.",

    Confidentiality:
      "Addresses protection and disclosure requirements for confidential information.",

    Payment:
      "Defines payment obligations, deadlines, and financial responsibilities between parties.",
  };

  return (
    summaries[type ?? ""] ??
    "This clause contains important contractual obligations and requirements."
  );
}

function ClauseCard({
  clause,
}: {
  clause: { type?: string; text?: string; page_no?: number | null };
}) {
  const [expanded, setExpanded] = useState(false);

  const text = cleanDisplayText(clause.text);
  const summary = createClauseSummary(clause.type);

  return (
    <div className="rounded-xl border border-border/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">{clause.type ?? "Clause"}</h3>

          <p className="text-xs text-muted-foreground mt-1">
            Page {clause.page_no ?? "—"}
          </p>
        </div>

        <RiskBadge level="high" />
      </div>

      <div className="mt-3 rounded-lg bg-muted/30 p-3">
        <p className="text-sm leading-6">{summary}</p>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-sm font-medium text-accent hover:underline"
      >
        {expanded ? "Hide Original Clause" : "View Original Clause"}
      </button>

      {expanded && (
        <div className="mt-3 border-t pt-3 text-sm leading-6 text-muted-foreground whitespace-pre-line">
          {text}
        </div>
      )}
    </div>
  );
}
const categoryMeta = [
  {
    icon: Scale,
    label: "Legal Risk",
    type: "Legal",
  },
  {
    icon: ClipboardCheck,
    label: "Compliance Risk",
    type: "Compliance",
  },
  {
    icon: AlertTriangle,
    label: "Financial Risk",
    type: "Financial",
  },
  {
    icon: Cog,
    label: "Operational Risk",
    type: "Operational",
  },
];

function RiskAnalysis({
  score,
  risk,
}: {
  score?: number | null;
  risk: {
    categories: {
      name: string;
      details: string[];
    }[];
    primarySources: string | null;
    businessImpact: string | null;
    assessment: string | null;
  };
}) {
  if (!risk.categories.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No risk analysis available.
      </p>
    );
  }

  const level =
    (score ?? 0) >= 70 ? "High" : (score ?? 0) >= 40 ? "Medium" : "Low";

  return (
    <div className="space-y-6">
      {/* Overall Risk */}
      <div>
        <h3 className="text-lg font-semibold">Overall Risk Score: {level}</h3>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          The overall risk score is determined by the severity and number of
          clauses that contain significant risks, particularly those related to
          legal obligations, confidentiality, operational requirements,
          liability, termination, and dispute resolution.
        </p>
      </div>

      {/* Categories */}
      {risk.categories.map((category) => (
        <div key={category.name} className="space-y-3">
          <h4 className="font-semibold text-base">• {category.name}</h4>

          <ul className="space-y-2 pl-6 list-disc">
            {category.details.map((detail, i) => (
              <li key={i} className="text-sm leading-7">
                {detail.replace(/^-/, "").trim()}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {risk.primarySources && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Primary Sources of Risk</h3>
          <p className="text-sm leading-7 text-muted-foreground">
            {risk.primarySources}
          </p>
        </div>
      )}
      {risk.businessImpact && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Potential Business Impact</h3>

          <div className="text-sm leading-7 text-muted-foreground whitespace-pre-line">
            {risk.businessImpact}
          </div>
        </div>
      )}
      {risk.assessment && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Overall Risk Assessment</h3>

          <p className="text-sm leading-7 text-muted-foreground">
            {risk.assessment}
          </p>
        </div>
      )}
    </div>
  );
}

function severityWeight(level: "low" | "medium" | "high" | "critical") {
  if (level === "high" || level === "critical") return 3;

  if (level === "medium") return 2;

  return 1;
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
