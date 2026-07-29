import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { RiskBadge } from "@/components/risk-badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, MessagesSquare, Users, Calendar, DollarSign, ClipboardType, Clock } from "lucide-react";
import { clauses } from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "Contract Analysis — Lexis AI" },
      { name: "description", content: "AI-extracted parties, dates, clauses and risk insights." },
    ],
  }),
  component: Analysis,
});

const info = [
  { icon: Users, label: "Parties", value: "Acme Corp · Northwind Ltd" },
  { icon: ClipboardType, label: "Contract Type", value: "Supply Agreement" },
  { icon: Clock, label: "Duration", value: "36 months" },
  { icon: DollarSign, label: "Amount", value: "$2,400,000" },
  { icon: Calendar, label: "Effective Date", value: "Aug 1, 2026" },
  { icon: Calendar, label: "Expiry Date", value: "Jul 31, 2029" },
];

function Analysis() {
  return (
    <AppShell
      title="Global Supply Agreement — Acme Corp"
      subtitle="Analyzed · 47 clauses detected · Risk score 72/100"
      actions={
        <div className="flex gap-2">
          <Button variant="outline"><Download className="h-4 w-4" /> Export</Button>
          <Button asChild className="gradient-navy text-white hover:opacity-90">
            <Link to="/chat"><MessagesSquare className="h-4 w-4" /> Ask AI</Link>
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Document viewer */}
        <Card className="lg:col-span-3 border-border overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
            <FileText className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium">Global_Supply_Agreement_v3.pdf</span>
            <span className="ml-auto text-xs text-muted-foreground">Page 4 of 28</span>
          </div>
          <div className="bg-muted/30 p-8 min-h-[720px]">
            <div className="max-w-2xl mx-auto bg-white rounded shadow-md border border-border p-10 text-sm leading-relaxed text-foreground space-y-4">
              <h2 className="text-lg font-bold text-center">GLOBAL SUPPLY AGREEMENT</h2>
              <p className="text-xs text-muted-foreground text-center">Between Acme Corp ("Buyer") and Northwind Ltd ("Supplier")</p>
              <p><strong>4. PAYMENT TERMS.</strong> Payment shall be due within thirty (30) days from receipt of invoice. <mark className="bg-warning/30 px-0.5">Late payments accrue interest at 1.5% per month</mark> compounded monthly.</p>
              <p><strong>5. LIABILITY.</strong> <mark className="bg-destructive/25 px-0.5">Supplier accepts unlimited liability for all direct and indirect damages arising from breach of this Agreement</mark>, including but not limited to consequential and punitive damages.</p>
              <p><strong>6. PENALTIES.</strong> <mark className="bg-destructive/20 px-0.5">In the event of delayed delivery, Supplier shall pay liquidated damages of 2% of contract value per week of delay</mark>, up to a maximum of 20%.</p>
              <p><strong>7. TERMINATION.</strong> Either party may terminate this Agreement upon ninety (90) days written notice to the other party…</p>
              <p><strong>8. CONFIDENTIALITY.</strong> Both parties agree to maintain confidentiality of proprietary information for a period of five (5) years from termination.</p>
            </div>
          </div>
        </Card>

        {/* Insights */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 border-border">
            <h3 className="font-semibold tracking-tight mb-4">Extracted Information</h3>
            <div className="space-y-3">
              {info.map((i) => (
                <div key={i.label} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-md bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                    <i.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{i.label}</div>
                    <div className="text-sm font-medium truncate">{i.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 border-border">
            <h3 className="font-semibold tracking-tight mb-4">Detected Clauses</h3>
            <div className="space-y-3">
              {clauses.map((c) => (
                <div key={c.key} className="p-3 rounded-lg border border-border hover:border-accent/30 transition-colors bg-card">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{c.name}</div>
                    <RiskBadge level={c.risk} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">{c.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
