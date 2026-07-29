import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { O as ClipboardCheck, c as ShieldAlert, f as Scale, i as TriangleAlert, w as Cog } from "../_libs/lucide-react.mjs";
import { n as Card, t as AppShell } from "./card-CzgJ9pTn.mjs";
import { t as RiskBadge } from "./risk-badge-D83KWsFt.mjs";
import { t as Progress } from "./progress-qf6AqgAF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/risk-n3yFmFUs.js
var import_jsx_runtime = require_jsx_runtime();
var categories = [
	{
		icon: Scale,
		label: "Legal Risk",
		score: 78,
		color: "oklch(0.58 0.22 27)"
	},
	{
		icon: ClipboardCheck,
		label: "Compliance Risk",
		score: 45,
		color: "oklch(0.78 0.16 75)"
	},
	{
		icon: TriangleAlert,
		label: "Financial Risk",
		score: 82,
		color: "oklch(0.58 0.22 27)"
	},
	{
		icon: Cog,
		label: "Operational Risk",
		score: 38,
		color: "oklch(0.65 0.16 155)"
	}
];
var findings = [
	{
		level: "critical",
		title: "Unlimited Liability Clause",
		reason: "The supplier accepts unlimited responsibility for all direct and indirect damages, with no cap on financial exposure.",
		recommendation: "Cap liability at the total contract value ($2.4M) and explicitly exclude indirect, consequential, and punitive damages."
	},
	{
		level: "high",
		title: "Aggressive Penalty Terms",
		reason: "Delay penalties of 2% per week of contract value are 3× above industry median (0.5-1%).",
		recommendation: "Negotiate down to 0.75%/week with a 10% total cap and add force-majeure carve-outs."
	},
	{
		level: "medium",
		title: "High Late-Payment Interest",
		reason: "1.5% monthly interest may exceed statutory limits in EU jurisdictions (max ~8% p.a.).",
		recommendation: "Align to statutory rate + 2% margin, jurisdiction-tested."
	},
	{
		level: "low",
		title: "Confidentiality Term",
		reason: "5-year confidentiality is within industry norms.",
		recommendation: "No change required."
	}
];
function Risk() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Risk Analysis",
		subtitle: "Global Supply Agreement — Acme Corp",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-1 p-6 border-border flex flex-col items-center text-center bg-white/90",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-semibold uppercase tracking-widest text-muted-foreground",
							children: "Overall Risk Score"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskGauge, { value: 72 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-semibold mt-3",
							children: "Medium-High Risk"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-2 max-w-xs",
							children: "Multiple material clauses require negotiation before signing."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-3 w-full mt-6 pt-6 border-t border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-2xl font-bold text-destructive",
									children: "3"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-muted-foreground uppercase tracking-wide",
									children: "High"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-2xl font-bold text-warning-foreground",
									children: "7"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-muted-foreground uppercase tracking-wide",
									children: "Medium"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-2xl font-bold text-success",
									children: "37"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-muted-foreground uppercase tracking-wide",
									children: "Low"
								})] })
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-2 p-6 border-border bg-white/90",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-semibold tracking-tight",
							children: "Risk Categories"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mb-6",
							children: "Breakdown by domain"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-5",
							children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 mb-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-9 w-9 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(c.icon, { className: "h-4 w-4 text-primary" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-sm font-medium",
											children: c.label
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-lg font-bold tabular-nums",
										style: { color: c.color },
										children: c.score
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: c.score,
								className: "h-2"
							})] }, c.label))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-3 space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold tracking-tight text-lg",
						children: "Detected Findings"
					}), findings.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "p-5 border-border hover:shadow-md transition-shadow bg-white/90",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-10 w-10 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-5 w-5 text-destructive" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3 flex-wrap",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "font-semibold",
										children: f.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskBadge, { level: f.level })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid md:grid-cols-2 gap-4 mt-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1",
										children: "Reason"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm",
										children: f.reason
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] font-semibold text-accent uppercase tracking-wide mb-1",
										children: "Recommendation"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm",
										children: f.recommendation
									})] })]
								})]
							})]
						})
					}, i))]
				})
			]
		})
	});
}
function RiskGauge({ value }) {
	const size = 200;
	const stroke = 14;
	const r = (size - stroke) / 2;
	const c = 2 * Math.PI * r;
	const offset = c - value / 100 * c;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mt-4",
		style: {
			width: size,
			height: size
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			width: size,
			height: size,
			className: "-rotate-90",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: size / 2,
				cy: size / 2,
				r,
				stroke: "oklch(0.92 0.01 255)",
				strokeWidth: stroke,
				fill: "none"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: size / 2,
				cy: size / 2,
				r,
				stroke: value > 70 ? "oklch(0.58 0.22 27)" : value > 40 ? "oklch(0.78 0.16 75)" : "oklch(0.65 0.16 155)",
				strokeWidth: stroke,
				fill: "none",
				strokeDasharray: c,
				strokeDashoffset: offset,
				strokeLinecap: "round",
				style: { transition: "stroke-dashoffset 1s ease" }
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute inset-0 flex flex-col items-center justify-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-5xl font-bold tabular-nums",
				children: value
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted-foreground",
				children: "/ 100"
			})]
		})]
	});
}
//#endregion
export { Risk as component };
