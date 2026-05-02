"""
Email notification service using Python's built-in smtplib.
Sends HTML emails for registration confirmation and status updates.
Gracefully skips sending if SMTP is not configured.
"""
import asyncio
import logging
import os
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from functools import partial
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)

TOURNAMENT_NAME = "Shining Star United Football Tournament 2025"
SUPPORT_EMAIL = settings.SMTP_FROM

# ── Load club logo as base64 for inline email embedding ───────────────────────
_LOGO_B64: str = ""
_LOGO_B64_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../utils/logo_b64.txt")
try:
    with open(_LOGO_B64_PATH) as f:
        _LOGO_B64 = f.read().strip()
except Exception:
    pass  # Falls back to emoji if file not found


def _logo_html(size: int = 80) -> str:
    """Return an inline <img> tag with the club logo, or a text fallback."""
    if _LOGO_B64:
        return (
            f'<img src="data:image/png;base64,{_LOGO_B64}" '
            f'width="{size}" height="{size}" '
            f'alt="Shining Star United Hamren" '
            f'style="border-radius:50%;display:block;margin:0 auto 8px;" />'
        )
    return '<div style="font-size:40px;text-align:center;margin-bottom:8px;">⚽</div>'


def _build_email(to: str, subject: str, html: str, text: str) -> MIMEMultipart:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{TOURNAMENT_NAME} <{settings.SMTP_FROM}>"
    msg["To"] = to
    msg.attach(MIMEText(text, "plain"))
    msg.attach(MIMEText(html, "html"))
    return msg


def _send_sync(msg: MIMEMultipart, to: str) -> None:
    """Synchronous SMTP send — runs in a thread pool."""
    context = ssl.create_default_context()
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.ehlo()
        if settings.SMTP_TLS:
            server.starttls(context=context)
            server.ehlo()
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM, to, msg.as_string())
    logger.info("Email sent to %s: %s", to, msg["Subject"])


async def _send(msg: MIMEMultipart, to: str) -> None:
    """Send email asynchronously without blocking the event loop."""
    if not settings.SMTP_HOST:
        logger.info("📧 Email would be sent to %s: %s (SMTP not configured)", to, msg["Subject"])
        return
    loop = asyncio.get_event_loop()
    try:
        await loop.run_in_executor(None, partial(_send_sync, msg, to))
    except Exception as exc:
        # Never crash the request because of email failure
        logger.error("Failed to send email to %s: %s", to, exc)


# ── Email templates ────────────────────────────────────────────────────────────

def _base_html(content: str) -> str:
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{TOURNAMENT_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#1a1a1a;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a2744,#0f1a33);padding:28px 40px 24px;text-align:center;border-bottom:3px solid #ea580c;">
              {_logo_html(90)}
              <h1 style="margin:0;color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">
                Shining Star United
              </h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:2px;text-transform:uppercase;">
                Hamren · Football Tournament 2025
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              {content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
              <p style="margin:0;color:#555;font-size:12px;">
                © 2025 Shining Star United · Hamren · All rights reserved
              </p>
              <p style="margin:4px 0 0;color:#555;font-size:12px;">
                This is an automated email. Please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


async def send_registration_confirmation(
    to_email: str,
    team_name: str,
    manager_name: str,
    registration_id: str,
    player_count: int,
) -> None:
    """Send registration confirmation email after team registers."""
    subject = f"✅ Registration Received — {team_name} | {TOURNAMENT_NAME}"

    html_content = f"""
      <h2 style="margin:0 0 8px;color:#fff;font-size:20px;">Registration Received!</h2>
      <p style="margin:0 0 24px;color:#aaa;font-size:14px;">
        Hi <strong style="color:#fff;">{manager_name}</strong>, your team has been successfully registered.
      </p>

      <div style="background:#111;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #2a2a2a;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;color:#888;font-size:13px;width:140px;">Registration ID</td>
            <td style="padding:6px 0;color:#f97316;font-size:13px;font-family:monospace;font-weight:700;">
              {registration_id}
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#888;font-size:13px;">Team Name</td>
            <td style="padding:6px 0;color:#fff;font-size:13px;">{team_name}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#888;font-size:13px;">Players</td>
            <td style="padding:6px 0;color:#fff;font-size:13px;">{player_count}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#888;font-size:13px;">Status</td>
            <td style="padding:6px 0;">
              <span style="background:#854d0e;color:#fbbf24;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;">
                Pending Review
              </span>
            </td>
          </tr>
        </table>
      </div>

      <div style="background:#1c2a1c;border:1px solid #2d4a2d;border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;color:#86efac;font-size:13px;line-height:1.6;">
          <strong>What happens next?</strong><br/>
          Our admin team will review your payment screenshot (₹801 registration fee) and approve your registration within 24 hours.
          You will receive another email once your registration status is updated.
        </p>
      </div>

      <p style="margin:0;color:#666;font-size:12px;">
        Please save your Registration ID <strong style="color:#f97316;">{registration_id}</strong>
        for future reference.
      </p>
    """

    text_content = f"""
Registration Received — {TOURNAMENT_NAME}

Hi {manager_name},

Your team has been successfully registered!

Registration ID : {registration_id}
Team Name       : {team_name}
Players         : {player_count}
Status          : Pending Review

What happens next?
Our admin team will review your payment screenshot and approve your registration within 24 hours.
You will receive another email once your registration status is updated.

Please save your Registration ID: {registration_id}

© 2025 Shining Star United
    """.strip()

    msg = _build_email(to_email, subject, _base_html(html_content), text_content)
    await _send(msg, to_email)


async def send_status_update(
    to_email: str,
    team_name: str,
    manager_name: str,
    registration_id: str,
    new_status: str,
) -> None:
    """Send email when admin approves or rejects a registration."""
    if new_status == "approved":
        subject = f"🎉 Registration Approved — {team_name} | {TOURNAMENT_NAME}"
        status_badge = '<span style="background:#14532d;color:#4ade80;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;">Approved</span>'
        status_message = f"""
          <h2 style="margin:0 0 8px;color:#4ade80;font-size:20px;">🎉 You're In!</h2>
          <p style="margin:0 0 24px;color:#aaa;font-size:14px;">
            Congratulations <strong style="color:#fff;">{manager_name}</strong>!
            Your team <strong style="color:#fff;">{team_name}</strong> has been
            <strong style="color:#4ade80;">approved</strong> for the tournament.
          </p>
          <div style="background:#1c2a1c;border:1px solid #2d4a2d;border-radius:12px;padding:16px;margin-bottom:24px;">
            <p style="margin:0;color:#86efac;font-size:13px;line-height:1.6;">
              Please arrive at the venue on time. Bring this email and your Registration ID as proof of registration.
              Good luck! ⚽
            </p>
          </div>
        """
        text_status = "APPROVED — Congratulations! Your team has been approved for the tournament."
    else:
        subject = f"Registration Update — {team_name} | {TOURNAMENT_NAME}"
        status_badge = '<span style="background:#450a0a;color:#f87171;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;">Rejected</span>'
        status_message = f"""
          <h2 style="margin:0 0 8px;color:#f87171;font-size:20px;">Registration Not Approved</h2>
          <p style="margin:0 0 24px;color:#aaa;font-size:14px;">
            Hi <strong style="color:#fff;">{manager_name}</strong>, unfortunately your team
            <strong style="color:#fff;">{team_name}</strong>'s registration has not been approved.
          </p>
          <div style="background:#2a1c1c;border:1px solid #4a2d2d;border-radius:12px;padding:16px;margin-bottom:24px;">
            <p style="margin:0;color:#fca5a5;font-size:13px;line-height:1.6;">
              If you believe this is an error or need clarification, please contact the tournament organiser.
            </p>
          </div>
        """
        text_status = "REJECTED — Your registration was not approved. Please contact the organiser for details."

    html_content = f"""
      {status_message}
      <div style="background:#111;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #2a2a2a;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;color:#888;font-size:13px;width:140px;">Registration ID</td>
            <td style="padding:6px 0;color:#f97316;font-size:13px;font-family:monospace;font-weight:700;">
              {registration_id}
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#888;font-size:13px;">Team Name</td>
            <td style="padding:6px 0;color:#fff;font-size:13px;">{team_name}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#888;font-size:13px;">Status</td>
            <td style="padding:6px 0;">{status_badge}</td>
          </tr>
        </table>
      </div>
    """

    text_content = f"""
Registration Status Update — {TOURNAMENT_NAME}

Hi {manager_name},

{text_status}

Registration ID : {registration_id}
Team Name       : {team_name}

© 2025 Shining Star United
    """.strip()

    msg = _build_email(to_email, subject, _base_html(html_content), text_content)
    await _send(msg, to_email)
