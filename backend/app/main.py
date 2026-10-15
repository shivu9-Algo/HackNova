"""
FastAPI Gateway Application for AI Agent Safety and Control.
Exposes REST endpoints for action evaluation, audit logs, human approval workflows,
kill-switch management, live statistics, and demo runners.
"""

from fastapi import FastAPI, HTTPException, Path, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import os

from app.database import (
    init_db,
    get_logs,
    get_log_by_id,
    get_stats,
    update_log_status,
    clear_logs
)
from app.models import (
    ActionRequest,
    DecisionResponse,
    KillSwitchStatus,
    KillSwitchToggle,
    StatsResponse,
    ApprovalPayload
)
from app.guard import (
    evaluate_action,
    is_kill_switch_active,
    set_kill_switch,
    load_rules,
    save_rules
)
from app.tools import execute_tool
from app.agent import (
    run_agent_scenario,
    run_all_scenarios_sequence,
    run_unified_agent_task,
    get_agent_config_status,
    DEMO_SCENARIOS
)
from app.inbox import get_fake_inbox

# Initialize database tables on application import/startup
init_db()

app = FastAPI(
    title="AegisGuard AI Agent Safety Gateway",
    description="High-security policy enforcement gateway for autonomous AI agents.",
    version="1.0.0"
)

# Enable CORS for frontend dashboard (allow all origins in development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    """Service health and gateway status."""
    return {
        "service": "AegisGuard AI Agent Safety and Control Gateway",
        "status": "online",
        "kill_switch_active": is_kill_switch_active()
    }

@app.post("/action", response_model=DecisionResponse)
def post_action(action: ActionRequest):
    """
    Core Gateway Endpoint:
    Receives proposed action from an AI agent, evaluates risk score, applies policy,
    records audit log, and executes tool if authorized.
    """
    decision_result = evaluate_action(
        agent_id=action.agent_id,
        tool=action.tool,
        target=action.target,
        amount=action.amount,
        content=action.content
    )
    return decision_result

@app.get("/logs")
def get_all_logs(limit: int = 100):
    """Retrieve audit logs, newest first."""
    return get_logs(limit=limit)

@app.get("/stats")
def get_dashboard_stats():
    """Retrieve aggregated stats on allowed, escalated, and blocked decisions."""
    return get_stats()

@app.post("/approve/{log_id}")
def approve_escalated_action(
    log_id: int = Path(..., description="ID of the escalated action to approve"),
    payload: Optional[ApprovalPayload] = None
):
    """
    Human-in-the-Loop Approval:
    Authorizes a pending escalated action, executes simulated tool, and updates status.
    """
    log_entry = get_log_by_id(log_id)
    if not log_entry:
        raise HTTPException(status_code=404, detail=f"Log ID {log_id} not found.")

    if log_entry["status"] != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Action is not pending review (current status: '{log_entry['status']}')."
        )

    # Execute the simulated business tool now that human supervisor has approved it
    exec_result = execute_tool(
        tool=log_entry["tool"],
        target=log_entry["target"],
        amount=log_entry["amount"],
        content=log_entry["content"]
    )

    note = "Approved by Supervisor"
    if payload and payload.reviewer_comment:
        note += f": {payload.reviewer_comment}"

    update_log_status(
        log_id=log_id,
        status="approved",
        additional_reason=note,
        tool_result=exec_result
    )

    updated_log = get_log_by_id(log_id)
    return {
        "success": True,
        "message": f"Action #{log_id} approved and executed successfully.",
        "log": updated_log
    }

@app.post("/reject/{log_id}")
def reject_escalated_action(
    log_id: int = Path(..., description="ID of the escalated action to reject"),
    payload: Optional[ApprovalPayload] = None
):
    """
    Human-in-the-Loop Rejection:
    Denies a pending escalated action. Tool will NOT be executed.
    """
    log_entry = get_log_by_id(log_id)
    if not log_entry:
        raise HTTPException(status_code=404, detail=f"Log ID {log_id} not found.")

    if log_entry["status"] != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Action is not pending review (current status: '{log_entry['status']}')."
        )

    note = "Rejected by Supervisor"
    if payload and payload.reviewer_comment:
        note += f": {payload.reviewer_comment}"

    update_log_status(
        log_id=log_id,
        status="rejected",
        additional_reason=note,
        tool_result="Action Denied by Security Operator"
    )

    updated_log = get_log_by_id(log_id)
    return {
        "success": True,
        "message": f"Action #{log_id} rejected.",
        "log": updated_log
    }

@app.get("/killswitch", response_model=KillSwitchStatus)
def get_kill_switch_state():
    """Check current state of emergency kill switch."""
    return {"kill_switch": is_kill_switch_active()}

@app.post("/killswitch", response_model=KillSwitchStatus)
def toggle_kill_switch(payload: Optional[KillSwitchToggle] = None):
    """
    Activate or deactivate the emergency kill switch.
    When ON, every incoming action from any agent is immediately blocked.
    """
    if payload and payload.active is not None:
        new_state = set_kill_switch(payload.active)
    else:
        # Toggle current state
        new_state = set_kill_switch(not is_kill_switch_active())
    
    return {"kill_switch": new_state}

# Demo scenarios and configuration endpoints
@app.get("/demo/scenarios")
def list_demo_scenarios():
    """List details of the 3 pre-scripted agent scenarios."""
    return DEMO_SCENARIOS

class ScenarioRunRequest(BaseModel):
    amount: Optional[float] = None

@app.post("/demo/scenario/{scenario_id}")
def run_scenario(scenario_id: int, payload: Optional[ScenarioRunRequest] = None):
    """Execute a specific demo scenario through the simulated agent with optional custom amount."""
    try:
        amount_override = payload.amount if payload else None
        return run_agent_scenario(scenario_id, amount_override=amount_override)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/demo/run-all")
def run_all_scenarios():
    """Trigger all 3 demo scenarios in succession."""
    return run_all_scenarios_sequence()

@app.get("/rules")
def get_current_rules():
    """Inspect the active rules.json configuration."""
    return load_rules()

@app.put("/rules")
def update_rules(rules: Dict[str, Any] = Body(...)):
    """Dynamically update rules.json without restarting the server."""
    save_rules(rules)
    return {"success": True, "message": "Rules updated successfully.", "rules": rules}

@app.post("/logs/reset")
def reset_logs():
    """Clear audit logs table (useful for fresh demo resets)."""
    clear_logs()
    return {"success": True, "message": "Audit logs cleared."}

# =========================================================================
# LLM Agent Endpoints (Gemini Function Calling & Scripted Fallback)
# =========================================================================

class AgentTaskRequest(BaseModel):
    task: str
    mode: Optional[str] = "auto"  # 'gemini' | 'scripted' | 'auto'
    api_key: Optional[str] = None
    wait_for_escalations: Optional[bool] = True
    escalation_timeout: Optional[int] = 40

class AgentKeyRequest(BaseModel):
    api_key: str

@app.get("/agent/status")
def get_agent_status():
    """Returns Gemini API key status and agent execution modes."""
    return get_agent_config_status()

@app.get("/agent/inbox")
def get_agent_inbox():
    """Inspect simulated enterprise inbox including the poisoned email."""
    return {"inbox": get_fake_inbox()}

@app.post("/agent/run")
def execute_agent_task_endpoint(payload: AgentTaskRequest):
    """
    Executes a user plain text task using Gemini function calling or scripted fallback.
    Every tool call is strictly mediated through POST /action (the guard).
    """
    try:
        result = run_unified_agent_task(
            task_prompt=payload.task,
            mode=payload.mode or "auto",
            api_key=payload.api_key,
            wait_for_escalations=payload.wait_for_escalations if payload.wait_for_escalations is not None else True,
            escalation_timeout=payload.escalation_timeout or 40
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agent/key")
def set_agent_api_key(payload: AgentKeyRequest):
    """Dynamically set the Gemini API key in backend process environment."""
    key = payload.api_key.strip()
    if not key:
        raise HTTPException(status_code=400, detail="API key cannot be empty.")
    os.environ["GEMINI_API_KEY"] = key
    return {"success": True, "message": "Gemini API key configured for current session."}
