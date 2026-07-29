import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as cn } from "./card-CzgJ9pTn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/risk-badge-D83KWsFt.js
var import_jsx_runtime = require_jsx_runtime();
var styles = {
	low: "bg-success/10 text-success border-success/20",
	medium: "bg-warning/15 text-warning-foreground border-warning/30",
	high: "bg-destructive/10 text-destructive border-destructive/20",
	critical: "bg-destructive text-destructive-foreground border-destructive"
};
var labels = {
	low: "Low Risk",
	medium: "Medium Risk",
	high: "High Risk",
	critical: "Critical"
};
function RiskBadge({ level, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors duration-150", styles[level], className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-current" }), labels[level]]
	});
}
//#endregion
export { RiskBadge as t };
