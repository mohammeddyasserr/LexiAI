import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as Funnel, u as Search, x as Eye } from "../_libs/lucide-react.mjs";
import { n as Card, t as AppShell } from "./card-CzgJ9pTn.mjs";
import { t as RiskBadge } from "./risk-badge-D83KWsFt.mjs";
import { t as Button } from "./button-DEFu92TP.mjs";
import { r as contracts } from "./mock-data-DnGMdU-u.mjs";
import { t as Input } from "./input-iS9P3qFJ.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-RwruCalT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contracts-C4sazRiC.js
var import_jsx_runtime = require_jsx_runtime();
function Contracts() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Contracts",
		subtitle: "Your full contract library",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			className: "gradient-navy text-white hover:opacity-90",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/upload",
				children: "Upload"
			})
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "border-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 border-b border-border flex flex-wrap gap-3 items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1 min-w-64",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Search by name, party, or clause…",
						className: "pl-9"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "h-4 w-4" }), " Filters"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Contract" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Parties" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Value" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Risk" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "text-right",
					children: "Actions"
				})
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: contracts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
				className: "hover:bg-muted/40",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium",
						children: c.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-sm text-muted-foreground",
						children: c.parties.join(" · ")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium",
						children: c.amount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-sm text-muted-foreground",
						children: c.date
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskBadge, { level: c.risk }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/analysis",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" }), " Open"]
							})
						})
					})
				]
			}, c.id)) })] })]
		})
	});
}
//#endregion
export { Contracts as component };
