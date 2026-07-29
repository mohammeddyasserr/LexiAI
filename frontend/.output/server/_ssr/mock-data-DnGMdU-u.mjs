//#region node_modules/.nitro/vite/services/ssr/assets/mock-data-DnGMdU-u.js
var contracts = [
	{
		id: "c1",
		name: "Global Supply Agreement — Acme Corp",
		type: "Supply",
		date: "2026-07-18",
		risk: "high",
		status: "Analyzed",
		amount: "$2.4M",
		parties: ["Acme Corp", "Northwind Ltd"]
	},
	{
		id: "c2",
		name: "SaaS Master Services Agreement",
		type: "MSA",
		date: "2026-07-15",
		risk: "medium",
		status: "Analyzed",
		amount: "$480K",
		parties: ["Contoso", "Litware"]
	},
	{
		id: "c3",
		name: "NDA — Project Falcon",
		type: "NDA",
		date: "2026-07-12",
		risk: "low",
		status: "Analyzed",
		amount: "—",
		parties: ["Fabrikam", "Adventure Works"]
	},
	{
		id: "c4",
		name: "Tender Response — Ministry of Transport",
		type: "Tender",
		date: "2026-07-10",
		risk: "critical",
		status: "Review",
		amount: "$18.7M",
		parties: ["MoT", "Consortium ABC"]
	},
	{
		id: "c5",
		name: "Employment Agreement — VP Engineering",
		type: "Employment",
		date: "2026-07-08",
		risk: "low",
		status: "Analyzed",
		amount: "$320K",
		parties: ["Lexis Inc", "J. Doe"]
	},
	{
		id: "c6",
		name: "Data Processing Addendum — Azure",
		type: "DPA",
		date: "2026-07-05",
		risk: "medium",
		status: "Processing",
		amount: "—",
		parties: ["Lexis Inc", "Microsoft"]
	},
	{
		id: "c7",
		name: "Distribution Agreement — EMEA",
		type: "Distribution",
		date: "2026-07-02",
		risk: "high",
		status: "Analyzed",
		amount: "$5.1M",
		parties: ["Lexis Inc", "EuroDist"]
	},
	{
		id: "c8",
		name: "License Agreement — API Platform",
		type: "License",
		date: "2026-06-28",
		risk: "low",
		status: "Pending",
		amount: "$95K",
		parties: ["Lexis Inc", "Startup XYZ"]
	}
];
var riskDistribution = [
	{
		name: "Low",
		value: 142,
		color: "oklch(0.65 0.16 155)"
	},
	{
		name: "Medium",
		value: 89,
		color: "oklch(0.78 0.16 75)"
	},
	{
		name: "High",
		value: 34,
		color: "oklch(0.58 0.22 27)"
	},
	{
		name: "Critical",
		value: 8,
		color: "oklch(0.4 0.2 27)"
	}
];
var categoryData = [
	{
		category: "MSA",
		count: 48
	},
	{
		category: "NDA",
		count: 72
	},
	{
		category: "Supply",
		count: 34
	},
	{
		category: "Tender",
		count: 21
	},
	{
		category: "License",
		count: 39
	},
	{
		category: "DPA",
		count: 27
	},
	{
		category: "Employment",
		count: 32
	}
];
var monthlyTrend = [
	{
		month: "Jan",
		contracts: 32,
		analyzed: 28
	},
	{
		month: "Feb",
		contracts: 41,
		analyzed: 39
	},
	{
		month: "Mar",
		contracts: 38,
		analyzed: 36
	},
	{
		month: "Apr",
		contracts: 54,
		analyzed: 51
	},
	{
		month: "May",
		contracts: 62,
		analyzed: 60
	},
	{
		month: "Jun",
		contracts: 71,
		analyzed: 68
	},
	{
		month: "Jul",
		contracts: 84,
		analyzed: 79
	}
];
var clauses = [
	{
		key: "payment",
		name: "Payment Terms",
		risk: "medium",
		text: "Payment due within thirty (30) days of invoice date. Late payments accrue interest at 1.5% per month."
	},
	{
		key: "termination",
		name: "Termination",
		risk: "low",
		text: "Either party may terminate this agreement upon ninety (90) days written notice."
	},
	{
		key: "penalty",
		name: "Penalty Clause",
		risk: "high",
		text: "In the event of delayed delivery, Supplier shall pay liquidated damages of 2% of contract value per week of delay."
	},
	{
		key: "liability",
		name: "Liability",
		risk: "critical",
		text: "Supplier accepts unlimited liability for all direct and indirect damages arising from breach of contract."
	},
	{
		key: "confidentiality",
		name: "Confidentiality",
		risk: "low",
		text: "Both parties agree to maintain the confidentiality of proprietary information for a period of five (5) years."
	}
];
//#endregion
export { riskDistribution as a, monthlyTrend as i, clauses as n, contracts as r, categoryData as t };
