"""
Guard Engine for AI Agent Safety and Control Gateway.
Evaluates agent actions against rules.json, risk scoring thresholds,
rate limits, and emergency kill switches.
"""

import json
import os
import re
from datetime import datetime, timezone
from typing import Dict, Any, Tuple
from app.database import get_recent_deletes_count, insert_log
from app.tools import execute_tool

RULES_PATH = os.path.join(os.path.dirname(__file__), "rules.json")

# In-memory kill switch state (can be toggled by API)
_KILL_SWITCH_ACTIVE = False

def is_kill_switch_active() -> bool:
    """Return current state of emergency kill switch."""
    return _KILL_SWITCH_ACTIVE

def set_kill_switch(active: bool) -> bool:
    """Update state of emergency kill switch."""
    global _KILL_SWITCH_ACTIVE
    _KILL_SWITCH_ACTIVE = active
    return _KILL_SWITCH_ACTIVE

def load_rules() -> Dict[str, Any]:
    """
    Load rules from rules.json file.
    Re-read dynamically so configuration changes take effect without server restart.
    """
    try:
        with open(RULES_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        # Fallback default rules if file is temporarily inaccessible
        return {
            "thresholds": {"allow_max": 29, "escalate_max": 70, "block_min": 71},
            "tools": {
                "transfer_money": {"high_risk_threshold": 50000, "high_risk_penalty": 55},
                "delete_record": {"blocked_targets": ["customers"], "blocked_target_penalty": 95},
                "send_email": {"internal_domains": ["@company.com"], "external_domain_penalty": 40}
            },
            "injection_and_exfiltration": {"patterns": ["ignore previous instructions"], "penalty": 95}
        }

def save_rules(rules: Dict[str, Any]) -> bool:
    """Save updated rules back to rules.json."""
    with open(RULES_PATH, "w", encoding="utf-8") as f:
        json.dump(rules, f, indent=2)
    return True

def evaluate_action(
    agent_id: str,
    tool: str,
    target: str = None,
    amount: float = None,
    content: str = None
) -> Dict[str, Any]:
    """
    Core Guardrail Policy Engine.
    Evaluates risk score (0-100), applies rate limiting, checks injection patterns,
    determines decision ('allow' | 'escalate' | 'block'), and logs the decision.
    """
    rules = load_rules()
    thresholds = rules.get("thresholds", {"allow_max": 29, "escalate_max": 70, "block_min": 71})

    reasons = []
    score = 0

    # 1. Check Emergency Kill Switch
    if is_kill_switch_active():
        score = 100
        decision = "block"
        reason = "EMERGENCY KILL SWITCH ACTIVE: All autonomous agent actions are suspended by system administrator."
        status = "blocked"
        
        log_id = insert_log(
            agent_id=agent_id,
            tool=tool,
            target=target,
            amount=amount,
            score=score,
            decision=decision,
            reason=reason,
            status=status,
            content=content,
            tool_result=None
        )
        return {
            "id": log_id,
            "agent_id": agent_id,
            "tool": tool,
            "target": target,
            "amount": amount,
            "score": score,
            "decision": decision,
            "reason": reason,
            "status": status,
            "tool_result": None,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    # 2. Check Prompt Injection / Exfiltration in content or target
    injection_config = rules.get("injection_and_exfiltration", {})
    injection_patterns = injection_config.get("patterns", [])
    injection_penalty = injection_config.get("penalty", 95)

    search_text = f"{target or ''} {content or ''}".lower()
    injection_found = False

    for pattern in injection_patterns:
        if pattern.lower() in search_text:
            score += injection_penalty
            reasons.append(f"Prompt Injection / Data Exfiltration directive detected: '{pattern}'")
            injection_found = True
            break

    # 3. Tool-Specific Rules
    tools_config = rules.get("tools", {})

    if tool == "transfer_money":
        transfer_rules = tools_config.get("transfer_money", {})
        val = amount if amount is not None else 0.0

        critical_thresh = transfer_rules.get("critical_risk_threshold", 500000)
        critical_penalty = transfer_rules.get("critical_risk_penalty", 90)

        high_thresh = transfer_rules.get("high_risk_threshold", 50000)
        high_penalty = transfer_rules.get("high_risk_penalty", 55)

        if val > critical_thresh:
            score += critical_penalty
            reasons.append(f"Transfer amount ${val:,.2f} exceeds critical limit (${critical_thresh:,.2f})")
        elif val > high_thresh:
            score += high_penalty
            reasons.append(f"Transfer amount ${val:,.2f} exceeds high-risk threshold (${high_thresh:,.2f})")
        else:
            score += 10
            reasons.append(f"Transfer amount ${val:,.2f} within standard limits")

    elif tool == "delete_record":
        delete_rules = tools_config.get("delete_record", {})
        blocked_targets = [t.lower() for t in delete_rules.get("blocked_targets", [])]
        blocked_penalty = delete_rules.get("blocked_target_penalty", 95)
        
        # Check Rate Limit (more than 5 deletes per minute from one agent gets blocked)
        rate_limit_cfg = delete_rules.get("rate_limit", {"max_actions_per_minute": 5, "penalty": 90})
        max_deletes = rate_limit_cfg.get("max_actions_per_minute", 5)
        rate_penalty = rate_limit_cfg.get("penalty", 90)
        
        recent_deletes = get_recent_deletes_count(agent_id, seconds=60)
        if recent_deletes >= max_deletes:
            score += rate_penalty
            reasons.append(f"Rate limit exceeded: Agent has executed {recent_deletes} deletes in past 60s (max {max_deletes}/min)")

        # Check Protected / Sensitive Database targets
        target_clean = (target or "").strip().lower()
        is_blocked_target = any(bt in target_clean for bt in blocked_targets)
        if is_blocked_target:
            score += blocked_penalty
            reasons.append(f"Protected target '{target}' contains sensitive table or system logs prohibited from deletion")
        elif not recent_deletes >= max_deletes:
            score += 15
            reasons.append(f"Standard record deletion on unreserved target '{target}'")

    elif tool == "send_email":
        email_rules = tools_config.get("send_email", {})
        internal_domains = [d.lower() for d in email_rules.get("internal_domains", [])]
        blocked_domains = [d.lower() for d in email_rules.get("blocked_domains", [])]
        external_penalty = email_rules.get("external_domain_penalty", 40)
        blocked_domain_penalty = email_rules.get("blocked_domain_penalty", 95)

        target_clean = (target or "").strip().lower()

        # Malicious / Blocked domain check
        if any(bd in target_clean for bd in blocked_domains):
            score += blocked_domain_penalty
            reasons.append(f"Recipient '{target}' is located in a prohibited/blacklisted domain")
        elif any(target_clean.endswith(idom) for idom in internal_domains):
            score += 5
            reasons.append(f"Verified recipient '{target}' on internal domain")
        else:
            # External domain check
            score += external_penalty
            reasons.append(f"External recipient domain detected ('{target}'), potential leakage risk")

    else:
        # Unknown tool
        score += 35
        reasons.append(f"Unrecognized tool invocation '{tool}'")

    # Clamp score to 0 - 100
    score = min(max(score, 0), 100)

    # 4. Map Risk Score to Decision
    allow_max = thresholds.get("allow_max", 29)
    escalate_max = thresholds.get("escalate_max", 70)

    if score <= allow_max:
        decision = "allow"
        status = "executed"
        # Tool is executed immediately because action is verified safe!
        tool_result = execute_tool(tool=tool, target=target, amount=amount, content=content)
    elif score <= escalate_max:
        decision = "escalate"
        status = "pending"
        # Tool is NOT executed; waiting for human review
        tool_result = "Pending Human Approval via Security Dashboard"
    else:
        decision = "block"
        status = "blocked"
        # Tool is NOT executed; blocked by security policy
        tool_result = "Blocked by Security Policy"

    reason_str = " | ".join(reasons) if reasons else "Policy evaluation completed."

    # 5. Commit decision log to Database
    now_iso = datetime.now(timezone.utc).isoformat()
    log_id = insert_log(
        agent_id=agent_id,
        tool=tool,
        target=target,
        amount=amount,
        score=score,
        decision=decision,
        reason=reason_str,
        status=status,
        content=content,
        tool_result=tool_result,
        timestamp=now_iso
    )

    return {
        "id": log_id,
        "agent_id": agent_id,
        "tool": tool,
        "target": target,
        "amount": amount,
        "score": score,
        "decision": decision,
        "reason": reason_str,
        "status": status,
        "tool_result": tool_result,
        "timestamp": now_iso
    }
