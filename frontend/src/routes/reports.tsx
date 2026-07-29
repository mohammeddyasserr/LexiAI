import { createFileRoute } from "@tanstack/react-router";
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
  return (
    <AppShell
      title="Executive Report"
      subtitle="Auto-generated · Global Supply Agreement — Acme Corp"
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
                Global Supply Agreement
              </h1>
              <p className="text-muted-foreground mt-2 leading-6">
                Acme Corp × Northwind Ltd · 36-month term · $2.4M
              </p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-muted/30 p-4">
              <div className="grid grid-cols-2 gap-3">
                <Metric label="Risk Score" value="72" tone="warn" />
                <Metric label="Clauses" value="47" />
                <Metric label="Findings" value="10" tone="warn" />
                <Metric label="Confidence" value="94%" tone="ok" />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <Section title="Executive Summary">
            <p className="leading-7">
              This 36-month global supply agreement between{" "}
              <strong>Acme Corp</strong> and <strong>Northwind Ltd</strong> is a
              standard Buyer/Supplier contract valued at $2.4M. Our AI analysis
              identified <strong>three material risks</strong>
              requiring negotiation prior to execution — primarily concentrated
              in liability and penalty provisions. Overall drafting quality is
              high; commercial terms are within industry norms except where
              noted.
            </p>
          </Section>

          <Section title="Key Findings">
            <div className="grid gap-3">
              {[
                {
                  ok: false,
                  text: "Supplier accepts unlimited liability with no cap — critical exposure.",
                },
                {
                  ok: false,
                  text: "Delay penalties (2%/week) are 3× industry median.",
                },
                {
                  ok: false,
                  text: "Late-payment interest of 1.5%/mo may violate EU usury caps.",
                },
                {
                  ok: true,
                  text: "Termination notice (90 days) is balanced and standard.",
                },
                {
                  ok: true,
                  text: "Confidentiality period (5 years) is appropriate for the sector.",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/25 p-3"
                >
                  {f.ok ? (
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm leading-6">{f.text}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <Section title="Important Clauses">
          <div className="space-y-3">
            {[
              {
                name: "§5 Liability",
                risk: "critical" as const,
                note: "Unlimited scope — highest priority.",
              },
              {
                name: "§6 Penalties",
                risk: "high" as const,
                note: "Aggressive vs. peers.",
              },
              {
                name: "§4 Payment Terms",
                risk: "medium" as const,
                note: "Interest rate exceeds statutory ceilings.",
              },
              {
                name: "§7 Termination",
                risk: "low" as const,
                note: "Standard 90-day notice.",
              },
            ].map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div>
                  <div className="text-sm font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.note}</div>
                </div>
                <RiskBadge level={c.risk} />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Risk Analysis">
          <p>
            The composite risk score of <strong>72/100</strong> places this
            agreement in the <em>Medium-High</em> band. Financial risk (82)
            dominates the profile, driven by uncapped liability and penalty
            exposure. Operational and compliance risks are within acceptable
            bounds. Negotiating the three flagged findings would reduce the
            composite score to ~38.
          </p>
        </Section>

        <Section title="Recommendations">
          <div className="space-y-2">
            {[
              "Cap liability at contract value; exclude indirect and consequential damages.",
              "Reduce delay penalties to 0.75%/week with a 10% total cap and force-majeure carve-outs.",
              "Align late-payment interest to statutory rate + 2% margin.",
              "Add a mutual audit-rights clause given the multi-year, high-value nature of the deal.",
              "Consider adding a benchmarking clause to protect pricing over the 36-month term.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 rounded-lg border border-border/80 bg-muted/20 px-3 py-2.5"
              >
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span className="text-sm leading-6">{item}</span>
              </div>
            ))}
          </div>
        </Section>

        <div className="text-center text-xs text-muted-foreground pt-2 pb-6">
          Generated by Lexis AI · Model: gpt-4-turbo · Confidence 94% · Not
          legal advice.
        </div>
      </div>
    </AppShell>
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
