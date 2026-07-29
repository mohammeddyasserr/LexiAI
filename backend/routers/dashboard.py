from fastapi import APIRouter, HTTPException
from pathlib import Path
import json
from datetime import datetime, timedelta
from typing import Any

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

CONTRACTS_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "contracts.json"

@router.get("/stats")
def get_dashboard_stats():
    if not CONTRACTS_FILE.exists():
        return {
            "total_contracts": {"count": 0, "change": "0% vs last month"},
            "analyzed_contracts": {"count": 0, "change": "0%", "coverage": "0.0%"},
            "avg_risk_score": {"score": 0.0, "change": "0.0%"},
            "compliance_rate": {"rate": "0.0%", "change": "0.0%"},
            "monthly_trend": [],
            "risk_distribution": {"low": 0, "medium": 0, "high": 0, "critical": 0}
        }

    try:
        with open(CONTRACTS_FILE, "r", encoding="utf-8") as f:
            contracts = json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading contracts: {e}")

    if not isinstance(contracts, list):
        contracts = []

    # 1. Total and Analyzed count
    total_count = len(contracts)
    analyzed_contracts = [c for c in contracts if "report" in c and "risks" in c]
    analyzed_count = len(analyzed_contracts)
    
    # Coverage
    coverage_val = (analyzed_count / total_count * 100) if total_count > 0 else 0.0
    
    # Average Risk Score
    risk_scores = [c["risks"]["risk_score"] for c in analyzed_contracts if "risks" in c and "risk_score" in c["risks"]]
    avg_risk_score = sum(risk_scores) / len(risk_scores) if risk_scores else 0.0

    # Compliance Rate (score < 50)
    compliant_contracts = [score for score in risk_scores if score < 50.0]
    compliance_rate = (len(compliant_contracts) / len(risk_scores) * 100) if risk_scores else 0.0

    # 2. MoM Trend calculations
    # Parse upload date to YYYY-MM
    contracts_by_month = {}
    for c in contracts:
        upload_date_str = c.get("metadata", {}).get("upload_date")
        if not upload_date_str:
            continue
        try:
            # Format: YYYY-MM-DD
            dt = datetime.strptime(upload_date_str, "%Y-%m-%d")
            ym = dt.strftime("%Y-%m")
            contracts_by_month.setdefault(ym, []).append(c)
        except Exception:
            continue

    sorted_months = sorted(contracts_by_month.keys())

    # Find current and previous month
    if sorted_months:
        latest_month = sorted_months[-1]
        # Calculate calendar-wise previous month
        try:
            year, month = map(int, latest_month.split("-"))
            first_day_curr = datetime(year, month, 1)
            last_day_prev = first_day_curr - timedelta(days=1)
            prev_month = last_day_prev.strftime("%Y-%m")
        except Exception:
            prev_month = None
    else:
        latest_month = None
        prev_month = None

    # Helper to aggregate cumulative values up to a certain month
    def get_cumulative_metrics(up_to_month: str | None):
        if not up_to_month:
            return 0, 0, 0.0, 0.0
        
        sub_contracts = []
        for ym, list_c in contracts_by_month.items():
            if ym <= up_to_month:
                sub_contracts.extend(list_c)

        sub_total = len(sub_contracts)
        sub_analyzed = [c for c in sub_contracts if "report" in c and "risks" in c]
        sub_analyzed_count = len(sub_analyzed)

        sub_scores = [c["risks"]["risk_score"] for c in sub_analyzed if "risks" in c and "risk_score" in c["risks"]]
        sub_avg_risk = sum(sub_scores) / len(sub_scores) if sub_scores else 0.0

        sub_compliant = [score for score in sub_scores if score < 50.0]
        sub_compliance_rate = (len(sub_compliant) / len(sub_scores) * 100) if sub_scores else 0.0

        return sub_total, sub_analyzed_count, sub_avg_risk, sub_compliance_rate

    # Calculate MoM Changes
    total_curr, analyzed_curr, avg_risk_curr, compliance_curr = get_cumulative_metrics(latest_month)
    total_prev, analyzed_prev, avg_risk_prev, compliance_prev = get_cumulative_metrics(prev_month)

    # MoM Total Contracts change
    if total_prev > 0:
        total_change = ((total_curr - total_prev) / total_prev) * 100
        total_change_str = f"{total_change:+.1f}% vs last month"
    else:
        total_change_str = f"+{total_curr * 100:.1f}% vs last month" if total_curr > 0 else "0% vs last month"

    # MoM Analyzed Contracts change
    if analyzed_prev > 0:
        analyzed_change = ((analyzed_curr - analyzed_prev) / analyzed_prev) * 100
        analyzed_change_str = f"{analyzed_change:+.1f}%"
    else:
        analyzed_change_str = f"+{analyzed_curr * 100:.1f}%" if analyzed_curr > 0 else "0%"

    # MoM Avg Risk Score change
    if avg_risk_prev > 0:
        avg_risk_change = ((avg_risk_curr - avg_risk_prev) / avg_risk_prev) * 100
        avg_risk_change_str = f"{avg_risk_change:+.1f}%"
    else:
        avg_risk_change_str = "0.0%"

    # MoM Compliance Rate change
    if compliance_prev > 0:
        compliance_change = compliance_curr - compliance_prev
        compliance_change_str = f"{compliance_change:+.1f}%"
    else:
        compliance_change_str = "0.0%"

    # 3. Monthly Trend Chart Data
    monthly_trend = []
    if sorted_months:
        # Generate all months in range
        first_ym = sorted_months[0]
        last_ym = sorted_months[-1]
        
        try:
            start_dt = datetime.strptime(first_ym, "%Y-%m")
            end_dt = datetime.strptime(last_ym, "%Y-%m")
            
            # If only one month, let's include it
            curr_dt = start_dt
            while curr_dt <= end_dt:
                ym_str = curr_dt.strftime("%Y-%m")
                month_name = curr_dt.strftime("%b") # e.g. "Jan", "Feb"
                
                month_contracts = contracts_by_month.get(ym_str, [])
                uploaded_in_month = len(month_contracts)
                analyzed_in_month = len([c for c in month_contracts if "report" in c and "risks" in c])
                
                monthly_trend.append({
                    "month": month_name,
                    "uploaded": uploaded_in_month,
                    "analyzed": analyzed_in_month
                })
                
                # Increment month
                if curr_dt.month == 12:
                    curr_dt = datetime(curr_dt.year + 1, 1, 1)
                else:
                    curr_dt = datetime(curr_dt.year, curr_dt.month + 1, 1)
        except Exception:
            # Fallback to sorted keys
            for ym in sorted_months:
                try:
                    month_name = datetime.strptime(ym, "%Y-%m").strftime("%b")
                except Exception:
                    month_name = ym
                month_contracts = contracts_by_month.get(ym, [])
                monthly_trend.append({
                    "month": month_name,
                    "uploaded": len(month_contracts),
                    "analyzed": len([c for c in month_contracts if "report" in c and "risks" in c])
                })

    # 4. Risk Distribution
    risk_distribution = {"low": 0, "medium": 0, "high": 0, "critical": 0}
    for score in risk_scores:
        if score < 30.0:
            risk_distribution["low"] += 1
        elif score < 60.0:
            risk_distribution["medium"] += 1
        elif score < 85.0:
            risk_distribution["high"] += 1
        else:
            risk_distribution["critical"] += 1

    return {
        "total_contracts": {
            "count": total_count,
            "change": total_change_str
        },
        "analyzed_contracts": {
            "count": analyzed_count,
            "change": analyzed_change_str,
            "coverage": f"{coverage_val:.1f}%"
        },
        "avg_risk_score": {
            "score": round(avg_risk_score, 1),
            "change": avg_risk_change_str
        },
        "compliance_rate": {
            "rate": f"{compliance_rate:.1f}%",
            "change": compliance_change_str
        },
        "monthly_trend": monthly_trend,
        "risk_distribution": risk_distribution
    }
