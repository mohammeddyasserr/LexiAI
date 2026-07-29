import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { RiskBadge } from "@/components/risk-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Eye,
  Download,
} from "lucide-react";
import { getContracts, type Contract } from "@/lib/contracts-api";
import {
  getDashboardStats,
  type DashboardStatsResponse,
} from "@/lib/dashboard-api";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

function downloadContractPdf(contract: Contract) {
  const lines = [
    `Contract: ${contract.name}`,
    `Type: ${contract.type}`,
    `Date: ${contract.date}`,
    `Risk: ${contract.risk}`,
    `Amount: ${contract.amount}`,
    `Parties: ${contract.parties.length > 0 ? contract.parties.join(", ") : "-"}`,
    `Status: ${contract.status}`,
  ];

  const contentStream = lines
    .map((line, index) => {
      const y = 760 - index * 18;
      return `BT /F1 12 Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`;
    })
    .join("\n");

  const streamLength = new TextEncoder().encode(contentStream).length;
  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefPosition = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  offsets.forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R>>\nstartxref\n${xrefPosition}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sanitizeFilename(contract.name)}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapePdfText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function sanitizeFilename(value: string) {
  return value
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Lexis AI" },
      {
        name: "description",
        content: "Contract analytics, risk distribution, and recent activity.",
      },
    ],
  }),
  component: Dashboard,
});

export function Dashboard() {
  const {
    data: contractsData,
    isLoading: isContractsLoading,
    isError: isContractsError,
  } = useQuery<Contract[]>({
    queryKey: ["contracts"],
    queryFn: getContracts,
  });

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
  } = useQuery<DashboardStatsResponse>({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const recentContracts = (contractsData ?? []).slice(0, 6);
  const monthlyTrend = dashboardData?.monthly_trend ?? [];
  const riskDistribution = dashboardData?.risk_distribution
    ? [
        {
          name: "Low",
          value: dashboardData.risk_distribution.low,
          color: "oklch(0.65 0.16 155)",
        },
        {
          name: "Medium",
          value: dashboardData.risk_distribution.medium,
          color: "oklch(0.78 0.16 75)",
        },
        {
          name: "High",
          value: dashboardData.risk_distribution.high,
          color: "oklch(0.58 0.22 27)",
        },
        {
          name: "Critical",
          value: dashboardData.risk_distribution.critical,
          color: "oklch(0.4 0.2 27)",
        },
      ]
    : [];

  return (
    <AppShell
      title="Dashboard"
      subtitle="Overview of your contract portfolio and AI activity"
      actions={
        <Button asChild className="gradient-navy text-white hover:opacity-90">
          <Link to="/upload">Upload Contract</Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Contracts"
            value={
              isDashboardLoading
                ? "—"
                : String(dashboardData?.total_contracts.count ?? 0)
            }
            icon={FileText}
            delta={
              isDashboardLoading
                ? undefined
                : dashboardData?.total_contracts.change
            }
            hint={isDashboardLoading ? "Loading" : "vs. last month"}
          />
          <StatCard
            label="Analyzed"
            value={
              isDashboardLoading
                ? "—"
                : String(dashboardData?.analyzed_contracts.count ?? 0)
            }
            icon={ShieldCheck}
            delta={
              isDashboardLoading
                ? undefined
                : dashboardData?.analyzed_contracts.change
            }
            hint={
              isDashboardLoading
                ? "Loading"
                : dashboardData?.analyzed_contracts.coverage
            }
          />
          <StatCard
            label="Avg Risk Score"
            value={
              isDashboardLoading
                ? "—"
                : String(dashboardData?.avg_risk_score.score ?? 0)
            }
            icon={AlertTriangle}
            delta={
              isDashboardLoading
                ? undefined
                : dashboardData?.avg_risk_score.change
            }
            trend="down"
            hint={isDashboardLoading ? "Loading" : "lower is better"}
          />
          <StatCard
            label="Compliance Rate"
            value={
              isDashboardLoading
                ? "—"
                : String(dashboardData?.compliance_rate.rate ?? "0.0%")
            }
            icon={TrendingUp}
            delta={
              isDashboardLoading
                ? undefined
                : dashboardData?.compliance_rate.change
            }
            hint={isDashboardLoading ? "Loading" : "below 50 is compliant"}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2 border-border bg-white/90">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold tracking-tight">
                  Monthly Analysis Trend
                </h3>
                <p className="text-xs text-muted-foreground">
                  Contracts uploaded and analyzed
                </p>
              </div>
            </div>
            <div className="h-72">
              {isDashboardLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Loading trend data…
                </div>
              ) : isDashboardError ? (
                <div className="flex h-full items-center justify-center text-sm text-destructive">
                  We couldn’t load trend data from the backend.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="oklch(0.62 0.19 265)"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor="oklch(0.62 0.19 265)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="oklch(0.24 0.06 262)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor="oklch(0.24 0.06 262)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.92 0.01 255)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      stroke="oklch(0.5 0.02 258)"
                      fontSize={12}
                    />
                    <YAxis stroke="oklch(0.5 0.02 258)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid oklch(0.92 0.01 255)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="contracts"
                      stroke="oklch(0.24 0.06 262)"
                      fill="url(#g2)"
                      strokeWidth={2}
                      name="Uploaded"
                    />
                    <Area
                      type="monotone"
                      dataKey="analyzed"
                      stroke="oklch(0.62 0.19 265)"
                      fill="url(#g1)"
                      strokeWidth={2}
                      name="Analyzed"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card className="p-5 border-border bg-white/90">
            <h3 className="font-semibold tracking-tight">Risk Distribution</h3>
            <p className="text-xs text-muted-foreground">
              All active contracts
            </p>
            <div className="h-56 mt-2">
              {isDashboardLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Loading distribution data…
                </div>
              ) : isDashboardError ? (
                <div className="flex h-full items-center justify-center text-sm text-destructive">
                  We couldn’t load distribution data from the backend.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {riskDistribution.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid oklch(0.92 0.01 255)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {riskDistribution.map((r) => (
                <div key={r.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ background: r.color }}
                  />
                  <span className="text-muted-foreground">{r.name}</span>
                  <span className="font-semibold ml-auto">{r.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Contracts */}
        <Card className="border-border">
          <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
            <div>
              <h3 className="font-semibold tracking-tight">Recent Contracts</h3>
              <p className="text-xs text-muted-foreground">
                Latest uploads and analyses
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/contracts">View all</Link>
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isContractsLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    Loading recent contracts…
                  </TableCell>
                </TableRow>
              ) : isContractsError ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-sm text-destructive"
                  >
                    We couldn’t load recent contracts from the backend.
                  </TableCell>
                </TableRow>
              ) : recentContracts.length > 0 ? (
                recentContracts.map((c) => (
                  <TableRow key={c.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {c.date}
                    </TableCell>
                    <TableCell>
                      <RiskBadge level={c.risk} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" asChild>
                          <Link
                            to="/reports"
                            search={{ contractId: c.id, contract_id: c.id }}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          type="button"
                          onClick={() => downloadContractPdf(c)}
                          aria-label={`Download ${c.name}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No recent contracts were returned by the backend.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppShell>
  );
}
