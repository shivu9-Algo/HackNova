"""
Pydantic data models and schemas for API requests, responses, and logs.
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal, Dict, Any, List

class ActionRequest(BaseModel):
    """Input payload sent by an AI agent requesting an action."""
    agent_id: str = Field(..., description="Unique identifier for the calling AI agent")
    tool: str = Field(..., description="Tool name: send_email, delete_record, transfer_money")
    target: Optional[str] = Field(None, description="Action target: email address, table/row, account ID")
    amount: Optional[float] = Field(None, description="Numerical amount if tool is financial transfer")
    content: Optional[str] = Field(None, description="Message body, query payload, or prompt instructions")

class DecisionResponse(BaseModel):
    """Guard output returned to caller and saved to audit log."""
    id: Optional[int] = Field(None, description="Log record ID in database")
    agent_id: str
    tool: str
    target: Optional[str] = None
    amount: Optional[float] = None
    score: int = Field(..., description="Composite risk score from 0 to 100")
    decision: Literal["allow", "escalate", "block"] = Field(..., description="Action outcome")
    reason: str = Field(..., description="Human-readable explanation of why this decision was reached")
    status: Literal["executed", "pending", "approved", "rejected", "blocked"] = Field(...)
    tool_result: Optional[str] = Field(None, description="Execution result from simulated tool if allowed/approved")
    timestamp: str

class KillSwitchStatus(BaseModel):
    kill_switch: bool = Field(..., description="True if emergency kill switch is activated")

class KillSwitchToggle(BaseModel):
    active: Optional[bool] = Field(None, description="Explicitly set kill switch to True/False, or omit to toggle")

class StatsResponse(BaseModel):
    total: int
    allowed: int
    escalated: int
    blocked: int
    pending: int

class ApprovalPayload(BaseModel):
    reviewer_comment: Optional[str] = Field(None, description="Optional note from human supervisor")
