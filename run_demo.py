"""
CLI Demo Runner for AegisGuard AI Agent Safety and Control.
Demonstrates the 3 core hackathon scenarios directly in terminal:
1. Safe Action -> ALLOW
2. Risky Action -> ESCALATE (Human review)
3. Prompt Injection Attack -> BLOCK
"""

import sys
import os
import json
import time

# Ensure backend modules can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

from app.database import init_db
from app.agent import DEMO_SCENARIOS, run_agent_scenario
from app.guard import set_kill_switch, is_kill_switch_active

def print_separator():
    print("=" * 80)

def main():
    init_db()
    set_kill_switch(False)

    print_separator()
    print("  AEGISGUARD: AI AGENT SAFETY & CONTROL GATEWAY (DEVHOST 2026)")
    print("  Autonomous Agent Interception & Policy Enforcement Pipeline")
    print_separator()

    for sc_id in [1, 2, 3]:
        scenario = DEMO_SCENARIOS[sc_id]
        print(f"\n[RUNNING {scenario['title'].upper()}]")
        print(f"Goal:        {scenario['description']}")
        print(f"Expected:    {scenario['expected']}")
        print(f"Payload:     {json.dumps(scenario['payload'], indent=2)}")
        
        time.sleep(0.5)
        res = run_agent_scenario(sc_id)
        dec = res["decision_result"]

        print("\n--> GATEWAY VERDICT:")
        print(f"    Decision:    {dec['decision'].upper()}")
        print(f"    Risk Score:  {dec['score']}/100")
        print(f"    Status:      {dec['status']}")
        print(f"    Reason:      {dec['reason']}")
        print(f"    Tool Output: {dec['tool_result']}")
        print("-" * 80)
        time.sleep(0.5)

    print("\n[DEMO COMPLETE]")
    print("Start the backend (FastAPI) and frontend (React) to experience the live SOC dashboard!")
    print_separator()

if __name__ == "__main__":
    main()
