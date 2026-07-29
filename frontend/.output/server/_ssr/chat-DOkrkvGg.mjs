import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { N as ArrowUp, n as User, o as Sparkles, v as FileText } from "../_libs/lucide-react.mjs";
import { n as Card, r as cn, t as AppShell } from "./card-CzgJ9pTn.mjs";
import { t as Button } from "./button-DEFu92TP.mjs";
import { t as Input } from "./input-iS9P3qFJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/chat-DOkrkvGg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var seed = [{
	role: "assistant",
	text: "Hello — I'm your AI legal analyst. I've fully indexed **Global Supply Agreement — Acme Corp** and I'm ready to answer questions about parties, obligations, risks, and specific clauses. What would you like to know?"
}];
function Chat() {
	const [messages, setMessages] = (0, import_react.useState)(seed);
	const [input, setInput] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const send = (text) => {
		if (!text.trim()) return;
		const userMsg = {
			role: "user",
			text
		};
		setMessages((m) => [...m, userMsg]);
		setInput("");
		setLoading(true);
		setTimeout(() => {
			setMessages((m) => [...m, mockReply(text)]);
			setLoading(false);
		}, 900);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "AI Contract Chat",
		subtitle: "Grounded in Global Supply Agreement — Acme Corp",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 lg:grid-cols-4 h-[calc(100vh-8rem)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "hidden lg:flex lg:col-span-1 p-5 border-border flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground",
					children: "Context"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center gap-3 p-3 rounded-xl border border-border/80 bg-muted/30",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5 text-destructive" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-medium truncate",
							children: "Global Supply Agreement"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: "28 pages · 47 clauses"
						})]
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "lg:col-span-3 border-border flex flex-col overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 overflow-y-auto p-5 space-y-5",
					children: [messages.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageBubble, { msg: m }, i)), loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-8 w-8 rounded-lg gradient-ai flex items-center justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-white" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 rounded-full bg-accent animate-bounce" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "h-2 w-2 rounded-full bg-accent animate-bounce",
									style: { animationDelay: "120ms" }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "h-2 w-2 rounded-full bg-accent animate-bounce",
									style: { animationDelay: "240ms" }
								})
							]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t border-border/80 p-3.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: (e) => {
							e.preventDefault();
							send(input);
						},
						className: "relative flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: input,
							onChange: (e) => setInput(e.target.value),
							placeholder: "Ask anything about this contract…",
							className: "h-10 pr-14"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							size: "icon",
							className: "absolute right-1.5 h-8 w-8 rounded-xl gradient-navy text-white shadow-sm hover:opacity-90",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "h-4 w-4" })
						})]
					})
				})]
			})]
		})
	});
}
function MessageBubble({ msg }) {
	const isUser = msg.role === "user";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex gap-3", isUser && "flex-row-reverse"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", isUser ? "gradient-navy text-white" : "gradient-ai text-white"),
			children: isUser ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("max-w-[80%] space-y-2", isUser && "text-right"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("inline-block text-sm leading-relaxed rounded-2xl px-4 py-2.5", isUser ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"),
					children: msg.text
				}),
				msg.refs && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1.5",
					children: msg.refs.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[11px] px-2 py-0.5 rounded-md bg-accent/10 text-accent border border-accent/20 font-medium",
						children: [
							r.clause,
							" · p.",
							r.page
						]
					}, i))
				}),
				msg.confidence !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-[11px] text-muted-foreground",
					children: [
						"Confidence:",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-semibold text-foreground",
							children: [msg.confidence, "%"]
						})
					]
				})
			]
		})]
	});
}
function mockReply(q) {
	const lc = q.toLowerCase();
	if (lc.includes("payment")) return {
		role: "assistant",
		text: "Payment is due within **30 days** of invoice receipt. Late payments accrue interest at **1.5% per month**, compounded monthly. There is no early-payment discount.",
		refs: [{
			clause: "§4 Payment Terms",
			page: 4
		}],
		confidence: 96
	};
	if (lc.includes("risk")) return {
		role: "assistant",
		text: "Three material risks were detected: (1) **Unlimited liability** on the supplier — recommend capping at contract value; (2) **2%/week penalty** for delayed delivery — aggressive vs. industry norms; (3) **1.5% monthly interest** on late payments — may violate usury caps in some jurisdictions.",
		refs: [{
			clause: "§5 Liability",
			page: 5
		}, {
			clause: "§6 Penalties",
			page: 6
		}],
		confidence: 92
	};
	if (lc.includes("expire") || lc.includes("expir")) return {
		role: "assistant",
		text: "The contract expires on **July 31, 2029** — a 36-month term commencing August 1, 2026. Renewal is not automatic; either party may terminate earlier with 90 days written notice.",
		refs: [{
			clause: "§7 Termination",
			page: 7
		}],
		confidence: 98
	};
	return {
		role: "assistant",
		text: "This is a **36-month global supply agreement** between Acme Corp (Buyer) and Northwind Ltd (Supplier) valued at $2.4M. Key terms: Net-30 payments, 90-day termination notice, 5-year confidentiality. Notable risks include unlimited supplier liability and steep delay penalties.",
		refs: [{
			clause: "Executive Summary",
			page: 1
		}],
		confidence: 89
	};
}
//#endregion
export { Chat as component };
