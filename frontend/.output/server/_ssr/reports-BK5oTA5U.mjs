import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { A as CircleAlert, S as Download, k as CircleCheck, l as Share2, o as Sparkles } from "../_libs/lucide-react.mjs";
import { n as Card, t as AppShell } from "./card-CzgJ9pTn.mjs";
import { t as RiskBadge } from "./risk-badge-D83KWsFt.mjs";
import { t as Button } from "./button-DEFu92TP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-BK5oTA5U.js
var import_jsx_runtime = require_jsx_runtime();
function Reports() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Executive Report",
		subtitle: "Auto-generated · Global Supply Agreement — Acme Corp",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "h-4 w-4" }), " Share"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "gradient-navy text-white hover:opacity-90",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), " Download PDF"]
			})]
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-[1500px] 2xl:max-w-[1700px] space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-6 border-border relative overflow-hidden bg-white/90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 grid-bg opacity-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5" }), " AI Executive Report"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-3xl md:text-4xl font-semibold tracking-tight mt-2",
								children: "Global Supply Agreement"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted-foreground mt-2 leading-6",
								children: "Acme Corp × Northwind Ltd · 36-month term · $2.4M"
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-2xl border border-border/80 bg-muted/30 p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
										label: "Risk Score",
										value: "72",
										tone: "warn"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
										label: "Clauses",
										value: "47"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
										label: "Findings",
										value: "10",
										tone: "warn"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
										label: "Confidence",
										value: "94%",
										tone: "ok"
									})
								]
							})
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-5 lg:grid-cols-[1.05fr_0.95fr]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						title: "Executive Summary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "leading-7",
							children: [
								"This 36-month global supply agreement between",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Acme Corp" }),
								" and ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Northwind Ltd" }),
								" is a standard Buyer/Supplier contract valued at $2.4M. Our AI analysis identified ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "three material risks" }),
								"requiring negotiation prior to execution — primarily concentrated in liability and penalty provisions. Overall drafting quality is high; commercial terms are within industry norms except where noted."
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						title: "Key Findings",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-3",
							children: [
								{
									ok: false,
									text: "Supplier accepts unlimited liability with no cap — critical exposure."
								},
								{
									ok: false,
									text: "Delay penalties (2%/week) are 3× industry median."
								},
								{
									ok: false,
									text: "Late-payment interest of 1.5%/mo may violate EU usury caps."
								},
								{
									ok: true,
									text: "Termination notice (90 days) is balanced and standard."
								},
								{
									ok: true,
									text: "Confidentiality period (5 years) is appropriate for the sector."
								}
							].map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3 rounded-xl border border-border/80 bg-muted/25 p-3",
								children: [f.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5 text-success shrink-0 mt-0.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-5 w-5 text-destructive shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm leading-6",
									children: f.text
								})]
							}, i))
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Important Clauses",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: [
							{
								name: "§5 Liability",
								risk: "critical",
								note: "Unlimited scope — highest priority."
							},
							{
								name: "§6 Penalties",
								risk: "high",
								note: "Aggressive vs. peers."
							},
							{
								name: "§4 Payment Terms",
								risk: "medium",
								note: "Interest rate exceeds statutory ceilings."
							},
							{
								name: "§7 Termination",
								risk: "low",
								note: "Standard 90-day notice."
							}
						].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between p-3 rounded-lg border border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-semibold",
								children: c.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: c.note
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskBadge, { level: c.risk })]
						}, c.name))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Risk Analysis",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"The composite risk score of ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "72/100" }),
						" places this agreement in the ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "Medium-High" }),
						" band. Financial risk (82) dominates the profile, driven by uncapped liability and penalty exposure. Operational and compliance risks are within acceptable bounds. Negotiating the three flagged findings would reduce the composite score to ~38."
					] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Recommendations",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: [
							"Cap liability at contract value; exclude indirect and consequential damages.",
							"Reduce delay penalties to 0.75%/week with a 10% total cap and force-majeure carve-outs.",
							"Align late-payment interest to statutory rate + 2% margin.",
							"Add a mutual audit-rights clause given the multi-year, high-value nature of the deal.",
							"Consider adding a benchmarking clause to protect pricing over the 36-month term."
						].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-2 rounded-lg border border-border/80 bg-muted/20 px-3 py-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-success shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm leading-6",
								children: item
							})]
						}, item))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-center text-xs text-muted-foreground pt-2 pb-6",
					children: "Generated by Lexis AI · Model: gpt-4-turbo · Confidence 94% · Not legal advice."
				})
			]
		})
	});
}
function Metric({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `text-2xl font-bold tabular-nums ${tone === "ok" ? "text-success" : tone === "warn" ? "text-warning-foreground" : ""}`,
		children: value
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-[11px] uppercase tracking-wide text-muted-foreground mt-0.5",
		children: label
	})] });
}
function Section({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-6 border-border bg-white/90",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-lg font-semibold tracking-tight mb-3",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm leading-7 text-foreground/90 space-y-2",
			children
		})]
	});
}
//#endregion
export { Reports as component };
