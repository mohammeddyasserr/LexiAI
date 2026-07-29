import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { j as Check, o as Sparkles, r as Upload, v as FileText } from "../_libs/lucide-react.mjs";
import { n as Card, r as cn, t as AppShell } from "./card-CzgJ9pTn.mjs";
import { t as RiskBadge } from "./risk-badge-D83KWsFt.mjs";
import { t as Button } from "./button-DEFu92TP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/comparison--LcotuYl.js
var import_jsx_runtime = require_jsx_runtime();
var rows = [
	{
		feature: "Payment Terms",
		a: "Net 30, 1.5%/mo interest",
		b: "Net 45, 1.0%/mo interest",
		winner: "b"
	},
	{
		feature: "Contract Duration",
		a: "36 months",
		b: "24 months + 12mo option",
		winner: "b"
	},
	{
		feature: "Penalty Clause",
		a: "2%/week, cap 20%",
		b: "0.5%/week, cap 10%",
		winner: "b"
	},
	{
		feature: "Warranty",
		a: "12 months",
		b: "24 months",
		winner: "b"
	},
	{
		feature: "Termination Notice",
		a: "90 days",
		b: "60 days",
		winner: "a"
	},
	{
		feature: "Liability Cap",
		a: "Unlimited",
		b: "Contract value",
		winner: "b"
	}
];
function Comparison() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Contract Comparison",
		subtitle: "Side-by-side analysis with AI recommendations",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid md:grid-cols-2 gap-4 mb-6",
				children: [{
					label: "Contract A",
					name: "Global_Supply_Agreement_v3.pdf",
					risk: "high"
				}, {
					label: "Contract B",
					name: "Northwind_Proposal_v2.pdf",
					risk: "medium"
				}].map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5 border-border flex items-center gap-4 bg-white/90",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("h-12 w-12 rounded-lg flex items-center justify-center shrink-0", i === 0 ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-6 w-6" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: c.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold truncate",
									children: c.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskBadge, { level: c.risk })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-3.5 w-3.5" }), " Replace"]
						})
					]
				}, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-6 border-border mb-6 relative overflow-hidden bg-white/90",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 grid-bg opacity-40 pointer-events-none" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex items-start gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-11 w-11 rounded-xl gradient-ai flex items-center justify-center shadow-md shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-5 w-5 text-white" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-semibold text-accent uppercase tracking-widest",
							children: "AI Recommendation"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xl font-bold tracking-tight mt-1",
							children: "Contract B is the better option"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground mt-2 max-w-3xl",
							children: [
								"Northwind's proposal offers a capped liability, longer warranty, and materially lower penalty exposure — projected savings of",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "text-foreground",
									children: "$180K over 24 months"
								}),
								". The only trade-off is a shorter termination-notice window."
							]
						})
					] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border overflow-hidden bg-white/90",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-[1.4fr_1fr_1fr_auto] items-center px-5 py-3 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Feature" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Contract A" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Contract B" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-center w-20",
							children: "Winner"
						})
					]
				}), rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-[1.4fr_1fr_1fr_auto] items-center px-5 py-4 border-b border-border last:border-b-0 hover:bg-muted/20",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-medium",
							children: r.feature
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("text-sm", r.winner === "a" && "font-semibold text-success"),
							children: r.a
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("text-sm", r.winner === "b" && "font-semibold text-success"),
							children: r.b
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-20 flex justify-center",
							children: r.winner === "a" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1 text-xs font-semibold text-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" }), " A"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1 text-xs font-semibold text-accent",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" }), " B"]
							})
						})
					]
				}, r.feature))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid md:grid-cols-2 gap-4 mt-6",
				children: [{
					label: "Contract A · Risk Profile",
					score: 72,
					breakdown: [
						["Legal", 78],
						["Financial", 82],
						["Compliance", 45],
						["Operational", 38]
					]
				}, {
					label: "Contract B · Risk Profile",
					score: 42,
					breakdown: [
						["Legal", 40],
						["Financial", 45],
						["Compliance", 38],
						["Operational", 35]
					]
				}].map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5 border-border bg-white/90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-semibold",
							children: c.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("text-3xl font-bold tabular-nums", c.score > 60 ? "text-destructive" : "text-success"),
							children: c.score
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2 mt-4",
						children: c.breakdown.map(([label, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: v
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-1.5 bg-muted rounded-full overflow-hidden mt-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full rounded-full transition-all",
								style: {
									width: `${v}%`,
									background: v > 60 ? "oklch(0.58 0.22 27)" : v > 40 ? "oklch(0.78 0.16 75)" : "oklch(0.65 0.16 155)"
								}
							})
						})] }, label))
					})]
				}, i))
			})
		]
	});
}
//#endregion
export { Comparison as component };
