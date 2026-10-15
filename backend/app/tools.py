"""
Simulated business tools for AI Agent Safety and Control Gateway.
These tools simulate real-world actions (emailing, database deletions, financial transfers)
without side effects. All execution MUST be mediated and approved by the Guard.
"""

from typing import Optional
import random

def execute_tool(tool: str, target: Optional[str] = None, amount: Optional[float] = None, content: Optional[str] = None) -> str:
    """
    Executes simulated tool action only after authorization by the guardrail gateway.
    Returns a formatted human-readable execution receipt.
    """
    txn_ref = f"TXN-{random.randint(100000, 999999)}"
    
    if tool == "send_email":
        recipient = target or "unknown@domain.com"
        snippet = (content[:50] + "...") if content and len(content) > 50 else (content or "(empty)")
        return f"[SIMULATED SUCCESS] Email dispatched to {recipient}. Snippet: '{snippet}'. Dispatch Ref: {txn_ref}"

    elif tool == "delete_record":
        target_name = target or "generic_row"
        return f"[SIMULATED SUCCESS] Row/Table '{target_name}' deleted from production replica. Audit Trace ID: {txn_ref}"

    elif tool == "transfer_money":
        acc = target or "ACC-UNKNOWN"
        val = amount if amount is not None else 0.0
        return f"[SIMULATED SUCCESS] Wire transfer of ${val:,.2f} USD settled to beneficiary account '{acc}'. Wire Confirmation: {txn_ref}"

    else:
        return f"[SIMULATED ERROR] Unknown tool '{tool}' requested. No action taken."
