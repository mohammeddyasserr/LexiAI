import { createFileRoute, Link } from "@tanstack/react-router";
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
import {
  contracts,
  riskDistribution,
  categoryData,
  monthlyTrend,
} from "@/lib/mock-data";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from "recharts";

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
            value="273"
            icon={FileText}
            delta="+12.4%"
            hint="vs. last month"
          />
          <StatCard
            label="Analyzed"
            value="261"
            icon={ShieldCheck}
            delta="+8.1%"
            hint="95.6% coverage"
          />
          <StatCard
            label="Avg Risk Score"
            value="42"
            icon={AlertTriangle}
            delta="-3.2%"
            trend="down"
            hint="lower is better"
          />
          <StatCard
            label="Compliance Rate"
            value="96.8%"
            icon={TrendingUp}
            delta="+1.4%"
            hint="above target"
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
            </div>
          </Card>

          <Card className="p-5 border-border bg-white/90">
            <h3 className="font-semibold tracking-tight">Risk Distribution</h3>
            <p className="text-xs text-muted-foreground">
              All active contracts
            </p>
            <div className="h-56 mt-2">
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

        <Card className="p-5 border-border">
          <h3 className="font-semibold tracking-tight">
            Contracts by Category
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Distribution across contract types
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.92 0.01 255)"
                  vertical={false}
                />
                <XAxis
                  dataKey="category"
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
                  cursor={{ fill: "oklch(0.62 0.19 265 / 0.05)" }}
                />
                <Bar
                  dataKey="count"
                  fill="oklch(0.24 0.06 262)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

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
              {contracts.slice(0, 6).map((c) => (
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
                        <Link to="/analysis">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppShell>
  );
}
