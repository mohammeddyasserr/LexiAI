import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { T as CloudUpload, b as FileChartColumnIncreasing, c as ShieldAlert, d as ScanText, k as CircleCheck, m as LoaderCircle, v as FileText, y as FileSearch } from "../_libs/lucide-react.mjs";
import { n as Card, r as cn, t as AppShell } from "./card-CzgJ9pTn.mjs";
import { t as Button } from "./button-DEFu92TP.mjs";
import { t as Progress } from "./progress-qf6AqgAF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/upload-BxkpjX50.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var steps = [
	{
		icon: ScanText,
		label: "OCR Extraction",
		desc: "Recognizing text and structure"
	},
	{
		icon: FileSearch,
		label: "Clause Detection",
		desc: "Identifying 40+ clause types"
	},
	{
		icon: ShieldAlert,
		label: "Risk Analysis",
		desc: "Scoring liabilities and anomalies"
	},
	{
		icon: FileChartColumnIncreasing,
		label: "AI Report Generation",
		desc: "Composing executive summary"
	}
];
function UploadPage() {
	const [file, setFile] = (0, import_react.useState)(null);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [currentStep, setCurrentStep] = (0, import_react.useState)(-1);
	const [dragOver, setDragOver] = (0, import_react.useState)(false);
	const startUpload = () => {
		setFile({
			name: "Global_Supply_Agreement_v3.pdf",
			size: "2.4 MB"
		});
		setProgress(0);
		setCurrentStep(-1);
		let p = 0;
		const iv = setInterval(() => {
			p += 8;
			setProgress(Math.min(p, 100));
			if (p >= 100) {
				clearInterval(iv);
				runPipeline();
			}
		}, 120);
	};
	const runPipeline = () => {
		let s = 0;
		setCurrentStep(0);
		const iv = setInterval(() => {
			s++;
			if (s >= steps.length) {
				setCurrentStep(steps.length);
				clearInterval(iv);
			} else setCurrentStep(s);
		}, 1200);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Upload Contract",
		subtitle: "Drop your PDF or DOCX to begin analysis",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: cn("lg:col-span-3 border-2 border-dashed p-10 flex flex-col items-center justify-center text-center transition-all duration-150 min-h-96", dragOver ? "border-accent bg-accent/5 shadow-sm" : "border-border/80"),
				onDragOver: (e) => {
					e.preventDefault();
					setDragOver(true);
				},
				onDragLeave: () => setDragOver(false),
				onDrop: (e) => {
					e.preventDefault();
					setDragOver(false);
					startUpload();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-16 w-16 rounded-2xl gradient-ai flex items-center justify-center shadow-sm shadow-accent/20 mb-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "h-8 w-8 text-white" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-xl font-semibold tracking-tight",
						children: "Drop your contract here"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground mt-2 max-w-sm",
						children: "PDF, DOCX, or scanned images up to 50 MB. Your files are encrypted end-to-end."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-center mt-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: startUpload,
							className: "gradient-navy text-white hover:opacity-90",
							children: "Choose file"
						})
					}),
					file && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-full mt-8 max-w-md text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 p-3 rounded-xl border border-border/80 bg-muted/30",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-10 w-10 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5 text-destructive" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm font-medium truncate",
										children: file.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground",
										children: file.size
									})]
								}),
								progress === 100 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs font-medium",
									children: [progress, "%"]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
							value: progress,
							className: "mt-3 h-1.5"
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "lg:col-span-2 p-6 border-border/80",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold tracking-tight",
						children: "Processing Pipeline"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-1 mb-6 leading-5",
						children: "Live AI analysis stages"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "space-y-4",
						children: steps.map((s, i) => {
							const done = currentStep > i;
							const active = currentStep === i;
							const Icon = s.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: cn("h-9 w-9 rounded-lg flex items-center justify-center border shrink-0 transition-all", done && "bg-success/10 border-success/20 text-success", active && "bg-accent/10 border-accent/30 text-accent", !done && !active && "bg-muted border-border text-muted-foreground"),
									children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5" }) : active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 pt-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-sm font-medium",
										children: [
											"Step ",
											i + 1,
											": ",
											s.label
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground",
										children: s.desc
									})]
								})]
							}, s.label);
						})
					}),
					currentStep >= steps.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						className: "w-full mt-6 gradient-navy text-white hover:opacity-90",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/analysis",
							children: "View Analysis →"
						})
					})
				]
			})]
		})
	});
}
//#endregion
export { UploadPage as component };
