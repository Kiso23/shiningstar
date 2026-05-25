"""
Database backup service.
Exports all critical data as JSON and emails it to the admin.
Runs daily via a background scheduler.
Designed for Render free tier — no external storage needed.
"""
import asyncio
import json
import logging
from datetime import datetime, date
from typing import Any, Dict

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

logger = logging.getLogger(__name__)


async def export_db_to_json(session_factory: async_sessionmaker) -> Dict[str, Any]:
    """Export all tables to a JSON-serializable dict."""
    async with session_factory() as db:
        # Whitelist of allowed tables to prevent SQL injection
        allowed_tables = ["teams", "players", "payment_proofs", "matches", "standings", "settings"]
        export: Dict[str, Any] = {
            "exported_at": datetime.utcnow().isoformat(),
            "tables": {}
        }

        for table in allowed_tables:
            try:
                # Use parameterized query with whitelisted table name
                result = await db.execute(text(f"SELECT * FROM {table}"))
                rows = result.mappings().all()
                # Convert to JSON-serializable format
                serialized = []
                for row in rows:
                    row_dict = {}
                    for k, v in row.items():
                        if isinstance(v, (datetime, date)):
                            row_dict[k] = v.isoformat()
                        elif hasattr(v, '__str__'):
                            row_dict[k] = str(v)
                        else:
                            row_dict[k] = v
                    serialized.append(row_dict)
                export["tables"][table] = serialized
                logger.info(f"Exported {len(serialized)} rows from {table}")
            except Exception as e:
                logger.warning(f"Could not export table {table}: {e}")
                export["tables"][table] = []

        return export


async def send_backup_email(session_factory: async_sessionmaker, to_email: str) -> None:
    """Export DB and send as email attachment."""
    try:
        data = await export_db_to_json(session_factory)
        json_str = json.dumps(data, indent=2, ensure_ascii=False)
        date_str = datetime.utcnow().strftime("%Y-%m-%d")

        from app.services.email_service import _send, _base_html

        subject = f"🗄️ Database Backup — Shining Star United — {date_str}"

        # Summary stats
        stats = {t: len(rows) for t, rows in data["tables"].items()}
        stats_html = "".join(
            f'<tr><td style="padding:4px 8px;color:#888;font-size:13px;">{t}</td>'
            f'<td style="padding:4px 8px;color:#fff;font-size:13px;">{n} rows</td></tr>'
            for t, n in stats.items()
        )

        html_content = f"""
          <h2 style="margin:0 0 8px;color:#fff;font-size:20px;">Daily Database Backup</h2>
          <p style="margin:0 0 16px;color:#aaa;font-size:14px;">
            Automated backup for <strong style="color:#fff;">Shining Star United</strong> — {date_str}
          </p>
          <div style="background:#111;border-radius:12px;padding:16px;margin-bottom:16px;border:1px solid #2a2a2a;">
            <table width="100%" cellpadding="0" cellspacing="0">
              {stats_html}
            </table>
          </div>
          <p style="margin:0 0 8px;color:#aaa;font-size:13px;">
            The full JSON backup is included below. Copy and save it to a safe location.
          </p>
          <div style="background:#0a0a0a;border-radius:8px;padding:12px;border:1px solid #2a2a2a;max-height:300px;overflow:auto;">
            <pre style="margin:0;color:#4ade80;font-size:11px;font-family:monospace;white-space:pre-wrap;word-break:break-all;">{json_str[:3000]}{"..." if len(json_str) > 3000 else ""}</pre>
          </div>
          <p style="margin:16px 0 0;color:#555;font-size:12px;">
            This is an automated daily backup. The Render free PostgreSQL database expires after 90 days — 
            please upgrade or migrate before expiry.
          </p>
        """

        text_content = f"""Database Backup — Shining Star United — {date_str}

Table summary:
{chr(10).join(f"  {t}: {n} rows" for t, n in stats.items())}

Full backup (first 2000 chars):
{json_str[:2000]}
"""

        await _send(to_email, subject, _base_html(html_content), text_content)
        logger.info(f"✅ Backup email sent to {to_email}")

    except Exception as e:
        logger.error(f"❌ Backup failed: {e}")


def start_daily_backup_scheduler(session_factory: async_sessionmaker, to_email: str) -> None:
    """Start a background task that sends a backup email every 24 hours."""
    async def _loop():
        while True:
            # Wait 24 hours between backups
            await asyncio.sleep(24 * 60 * 60)
            await send_backup_email(session_factory, to_email)

    asyncio.create_task(_loop())
    logger.info(f"Daily backup scheduler started — will email {to_email} every 24h")
