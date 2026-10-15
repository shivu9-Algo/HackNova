"""
Database module for AI Agent Safety and Control Gateway.
Manages SQLite connection, schema initialization, and log querying.
"""

import sqlite3
import os
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

DB_FILE = os.path.join(os.path.dirname(__file__), "gateway.db")

def get_connection():
    """Return a database connection with dict-like row factory."""
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize SQLite database and create logs table if not exists."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                agent_id TEXT NOT NULL,
                tool TEXT NOT NULL,
                target TEXT,
                amount REAL,
                score INTEGER NOT NULL,
                decision TEXT NOT NULL,
                reason TEXT NOT NULL,
                status TEXT NOT NULL,
                content TEXT,
                tool_result TEXT
            )
        """)
        # Index on timestamp and agent_id for fast queries and rate limit counting
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_logs_agent ON logs(agent_id, tool, timestamp)")

        # Settings table (e.g. key: 'default_recipient')
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        """)

        # Saved Recipients table (id, email, label)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS saved_recipients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                label TEXT,
                created_at TEXT
            )
        """)

        # Initial seed for saved recipients if empty
        cursor.execute("SELECT COUNT(*) FROM saved_recipients")
        if cursor.fetchone()[0] == 0:
            now_str = datetime.now(timezone.utc).isoformat()
            cursor.execute("""
                INSERT INTO saved_recipients (email, label, created_at) VALUES 
                ('ops@company.com', 'Operations Lead', ?),
                ('security@company.com', 'SOC Alerts', ?),
                ('audit@external-partner.org', 'External Compliance Partner', ?)
            """, (now_str, now_str, now_str))

        # Initial seed for default_recipient if not set
        cursor.execute("SELECT value FROM settings WHERE key = 'default_recipient'")
        row = cursor.fetchone()
        if not row:
            cursor.execute("INSERT INTO settings (key, value) VALUES ('default_recipient', 'ops@company.com')")

        conn.commit()

def insert_log(
    agent_id: str,
    tool: str,
    target: Optional[str],
    amount: Optional[float],
    score: int,
    decision: str,
    reason: str,
    status: str,
    content: Optional[str] = None,
    tool_result: Optional[str] = None,
    timestamp: Optional[str] = None
) -> int:
    """Insert a new decision log and return its autoincrement ID."""
    if timestamp is None:
        timestamp = datetime.now(timezone.utc).isoformat()
    
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO logs (
                timestamp, agent_id, tool, target, amount, score, decision, reason, status, content, tool_result
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            timestamp, agent_id, tool, target, amount, score, decision, reason, status, content, tool_result
        ))
        conn.commit()
        return cursor.lastrowid

def get_logs(limit: int = 100) -> List[Dict[str, Any]]:
    """Retrieve all action logs ordered newest first."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM logs ORDER BY id DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_log_by_id(log_id: int) -> Optional[Dict[str, Any]]:
    """Retrieve a single log entry by primary key ID."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM logs WHERE id = ?", (log_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

def update_log_status(
    log_id: int,
    status: str,
    additional_reason: Optional[str] = None,
    tool_result: Optional[str] = None
) -> bool:
    """Update status ('approved', 'rejected', etc.) and optional tool result."""
    with get_connection() as conn:
        cursor = conn.cursor()
        if additional_reason and tool_result:
            cursor.execute("""
                UPDATE logs 
                SET status = ?, 
                    reason = reason || ' | ' || ?,
                    tool_result = ?
                WHERE id = ?
            """, (status, additional_reason, tool_result, log_id))
        elif additional_reason:
            cursor.execute("""
                UPDATE logs 
                SET status = ?, 
                    reason = reason || ' | ' || ?
                WHERE id = ?
            """, (status, additional_reason, log_id))
        elif tool_result:
            cursor.execute("""
                UPDATE logs 
                SET status = ?, 
                    tool_result = ?
                WHERE id = ?
            """, (status, tool_result, log_id))
        else:
            cursor.execute("UPDATE logs SET status = ? WHERE id = ?", (status, log_id))
        
        conn.commit()
        return cursor.rowcount > 0

def get_stats() -> Dict[str, Any]:
    """Calculate summary statistics for dashboard display."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM logs")
        total = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM logs WHERE decision = 'allow'")
        allowed = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM logs WHERE decision = 'escalate'")
        escalated = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM logs WHERE decision = 'block'")
        blocked = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM logs WHERE status = 'pending'")
        pending = cursor.fetchone()[0]

        return {
            "total": total,
            "allowed": allowed,
            "escalated": escalated,
            "blocked": blocked,
            "pending": pending
        }

def get_recent_deletes_count(agent_id: str, seconds: int = 60) -> int:
    """Count how many delete actions this agent submitted in the last N seconds."""
    # SQLite datetime functions work with UTC ISO strings
    with get_connection() as conn:
        cursor = conn.cursor()
        # Using unixepoch / strftime or filtering by ISO string
        threshold_iso = datetime.fromtimestamp(
            datetime.now(timezone.utc).timestamp() - seconds,
            tz=timezone.utc
        ).isoformat()
        
        cursor.execute("""
            SELECT COUNT(*) FROM logs
            WHERE agent_id = ? AND tool = 'delete_record' AND timestamp >= ?
        """, (agent_id, threshold_iso))
        return cursor.fetchone()[0]

def clear_logs() -> None:
    """Clear all records from logs table (useful for demo resetting)."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM logs")
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='logs'")
        conn.commit()
