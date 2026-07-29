import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { C as DollarSign, D as ClipboardType, E as Clock, M as Calendar, S as Download, p as MessagesSquare, t as Users, v as FileText } from "../_libs/lucide-react.mjs";
import { n as Card, t as AppShell } from "./card-CzgJ9pTn.mjs";
import { t as RiskBadge } from "./risk-badge-D83KWsFt.mjs";
import { t as Button } from "./button-DEFu92TP.mjs";
import { n as clauses } from "./mock-data-DnGMdU-u.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analysis-C6uBLDQO.js
var import_jsx_runtime = require_jsx_runtime();
var info = [
	{
		icon: Users,
		label: "Parties",
		value: "Acme Corp · Northwind Ltd"
	},
	{
		icon: ClipboardType,
		label: "Contract Type",
		value: "Supply Agreement"
	},
	{
		icon: Clock,
		label: "Duration",
		value: "36 months"
	},
	{
		icon: DollarSign,
		label: "Amount",
		value: "$2,400,000"
	},
	{
		icon: Calendar,
		label: "Effective Date",
		value: "Aug 1, 2026"
	},
	{
		icon: Calendar,
		label: "Expiry Date",
		value: "Jul 31, 2029"
	}
];
function Analysis() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Global Supply Agreement — Acme Corp",
		subtitle: "Analyzed · 47 clauses detected · Risk score 72/100",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), " Export"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "gradient-navy text-white hover:opacity-90",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/chat",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessagesSquare, { className: "h-4 w-4" }), " Ask AI"]
				})
			})]
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "lg:col-span-3 border-border overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 text-destructive" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-medium",
							children: "Global_Supply_Agreement_v3.pdf"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-auto text-xs text-muted-foreground",
							children: "Page 4 of 28"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "bg-muted/30 p-8 min-h-[720px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-w-2xl mx-auto bg-white rounded shadow-md border border-border p-10 text-sm leading-relaxed text-foreground space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-bold text-center",
								children: "GLOBAL SUPPLY AGREEMENT"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground text-center",
								children: "Between Acme Corp (\"Buyer\") and Northwind Ltd (\"Supplier\")"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "4. PAYMENT TERMS." }),
								" Payment shall be due within thirty (30) days from receipt of invoice. ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mark", {
									className: "bg-warning/30 px-0.5",
									children: "Late payments accrue interest at 1.5% per month"
								}),
								" compounded monthly."
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "5. LIABILITY." }),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mark", {
									className: "bg-destructive/25 px-0.5",
									children: "Supplier accepts unlimited liability for all direct and indirect damages arising from breach of this Agreement"
								}),
								", including but not limited to consequential and punitive damages."
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "6. PENALTIES." }),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mark", {
									className: "bg-destructive/20 px-0.5",
									children: "In the event of delayed delivery, Supplier shall pay liquidated damages of 2% of contract value per week of delay"
								}),
								", up to a maximum of 20%."
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "7. TERMINATION." }), " Either party may terminate this Agreement upon ninety (90) days written notice to the other party…"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "8. CONFIDENTIALITY." }), " Both parties agree to maintain confidentiality of proprietary information for a period of five (5) years from termination."] })
						]
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-2 space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5 border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold tracking-tight mb-4",
						children: "Extracted Information"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: info.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-8 w-8 rounded-md bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(i.icon, { className: "h-4 w-4 text-primary" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: i.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-medium truncate",
									children: i.value
								})]
							})]
						}, i.label))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5 border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold tracking-tight mb-4",
						children: "Detected Clauses"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: clauses.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3 rounded-lg border border-border hover:border-accent/30 transition-colors bg-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-semibold",
									children: c.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskBadge, { level: c.risk })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3",
								children: c.text
							})]
						}, c.key))
					})]
				})]
			})]
		})
	});
}
//#endregion
export { Analysis as component };
