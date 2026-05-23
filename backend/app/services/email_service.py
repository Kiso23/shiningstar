"""
Email notification service.
Uses Brevo (formerly Sendinblue) HTTP API - works on Render free tier.
Falls back gracefully if not configured.
"""
import asyncio
import logging
import json
import os
import urllib.request
from functools import partial

from app.config import settings

logger = logging.getLogger(__name__)

TOURNAMENT_NAME = "Shining Star United Football Tournament 2025"

# ── Load club logo as base64 ───────────────────────────────────────────────────
_LOGO_B64: str = ""
_LOGO_B64_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../utils/logo_b64.txt")
try:
    with open(_LOGO_B64_PATH) as f:
        _LOGO_B64 = f.read().strip()
except Exception:
    pass


def _logo_html(size: int = 80) -> str:
    if _LOGO_B64:
        return (
            f'<img src="data:image/png;base64,{_LOGO_B64}" '
            f'width="{size}" height="{size}" '
            f'alt="Shining Star United" '
            f'style="border-radius:50%;display:block;margin:0 auto 8px;" />'
        )
    return '<div style="font-size:40px;text-align:center;margin-bottom:8px;">⚽</div>'


def _base_html(content: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>{TOURNAMENT_NAME}</title></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#1a1a1a;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#1a2744,#0f1a33);padding:28px 40px 24px;text-align:center;border-bottom:3px solid #ea580c;">
            {_logo_html(90)}
            <h1 style="margin:0;color:#fff;font-size:20px;font-weight:800;">Shining Star United</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:2px;text-transform:uppercase;">
              Hamren · Football Tournament 2025
            </p>
          </td>
        </tr>
        <tr><td style="padding:36px 40px;">{content}</td></tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
            <p style="margin:0;color:#555;font-size:12px;">© 2025 Shining Star United · Hamren · All rights reserved</p>
            <p style="margin:4px 0 0;color:#555;font-size:12px;">This is an automated email. Please do not reply.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


def _send_via_brevo(to: str, subject: str, html: str, text: str, attachment_bytes: bytes = None, attachment_name: str = None) -> None:
    """Send email via Brevo HTTP API - works on Render free tier."""
    api_key = os.getenv("BREVO_API_KEY", "").strip()  # strip newlines/spaces
    if not api_key:
        logger.warning("BREVO_API_KEY not set, skipping email to %s", to)
        return

    from_email = settings.SMTP_FROM or "noreply@shiningstarunited.com"

    payload = {
        "sender": {"name": "Shining Star United", "email": from_email},
        "to": [{"email": to}],
        "subject": subject,
        "htmlContent": html,
        "textContent": text,
    }

    # Attach PDF if provided
    if attachment_bytes and attachment_name:
        import base64
        payload["attachment"] = [{
            "name": attachment_name,
            "content": base64.b64encode(attachment_bytes).decode("utf-8"),
        }]

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        "https://api.brevo.com/v3/smtp/email",
        data=data,
        headers={
            "accept": "application/json",
            "api-key": api_key,
            "content-type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=30) as response:
        response.read()
        logger.info("✅ Email sent via Brevo to %s: %s", to, subject)


async def _send(to: str, subject: str, html: str, text: str, attachment_bytes: bytes = None, attachment_name: str = None) -> None:
    """Send email via Brevo API."""
    loop = asyncio.get_event_loop()
    try:
        await loop.run_in_executor(None, partial(_send_via_brevo, to, subject, html, text, attachment_bytes, attachment_name))
    except Exception as exc:
        logger.error("❌ Email failed to %s: %s", to, exc)


async def send_registration_confirmation(
    to_email: str,
    team_name: str,
    manager_name: str,
    registration_id: str,
    player_count: int,
) -> None:
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
            <td style="padding:6px 0;color:#f97316;font-size:13px;font-family:monospace;font-weight:700;">{registration_id}</td>
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
              <span style="background:#854d0e;color:#fbbf24;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;">Pending Review</span>
            </td>
          </tr>
        </table>
      </div>
      <div style="background:#1c2a1c;border:1px solid #2d4a2d;border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;color:#86efac;font-size:13px;line-height:1.6;">
          <strong>What happens next?</strong><br/>
          Our admin team will review your payment screenshot (₹801 registration fee) and approve your registration within 24 hours.
        </p>
      </div>
      <p style="margin:0;color:#666;font-size:12px;">
        Please save your Registration ID <strong style="color:#f97316;">{registration_id}</strong> for future reference.
      </p>
    """

    text_content = f"""Registration Received — {TOURNAMENT_NAME}

Hi {manager_name},

Your team has been successfully registered!

Registration ID : {registration_id}
Team Name       : {team_name}
Players         : {player_count}
Status          : Pending Review

Our admin team will review your payment and approve within 24 hours.

© 2025 Shining Star United"""

    await _send(to_email, subject, _base_html(html_content), text_content)


async def send_status_update(
    to_email: str,
    team_name: str,
    manager_name: str,
    registration_id: str,
    new_status: str,
    players: list = None,
    player_count: int = 0,
    contact_phone: str = "",
    contact_email: str = "",
    created_at=None,
) -> None:
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
              Please arrive at the venue on time. Bring this email and your Registration ID as proof. Good luck! ⚽
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
              If you believe this is an error, please contact the tournament organiser.
            </p>
          </div>
        """
        text_status = "REJECTED — Your registration was not approved. Please contact the organiser."

    html_content = f"""
      {status_message}
      <div style="background:#111;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #2a2a2a;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;color:#888;font-size:13px;width:140px;">Registration ID</td>
            <td style="padding:6px 0;color:#f97316;font-size:13px;font-family:monospace;font-weight:700;">{registration_id}</td>
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

    text_content = f"""Registration Status Update — {TOURNAMENT_NAME}

Hi {manager_name},

{text_status}

Registration ID : {registration_id}
Team Name       : {team_name}

© 2025 Shining Star United"""

    # Generate and attach PDF for approved registrations
    pdf_bytes = None
    pdf_name = None
    rules_pdf_bytes = None
    if new_status == "approved" and players is not None:
        try:
            from app.services.pdf_service import generate_registration_pdf, generate_rules_pdf
            from datetime import datetime as _dt
            pdf_bytes = generate_registration_pdf(
                team_name=team_name,
                registration_id=registration_id,
                status=new_status,
                manager_name=manager_name,
                contact_phone=contact_phone,
                contact_email=contact_email,
                player_count=player_count,
                created_at=created_at or _dt.utcnow(),
                players=players,
            )
            pdf_name = f"{registration_id}_{team_name.replace(' ', '_')}.pdf"
            rules_pdf_bytes = generate_rules_pdf()
        except Exception as e:
            logger.warning("Could not generate PDF attachment: %s", e)

    # Send registration PDF
    await _send(to_email, subject, _base_html(html_content), text_content, pdf_bytes, pdf_name)

    # Send rules PDF as a separate email if approved
    if new_status == "approved" and rules_pdf_bytes:
        rules_subject = f"📋 Tournament Rules & Regulations — {TOURNAMENT_NAME}"
        rules_html = _base_html(f"""
          <h2 style="margin:0 0 8px;color:#fff;font-size:20px;">📋 Rules & Regulations</h2>
          <p style="margin:0 0 16px;color:#aaa;font-size:14px;">
            Hi <strong style="color:#fff;">{manager_name}</strong>, please find attached the official
            Rules & Regulations for the <strong style="color:#f97316;">SSU Champions Trophy</strong>.
          </p>
          <div style="background:#1c2a1c;border:1px solid #2d4a2d;border-radius:12px;padding:16px;margin-bottom:16px;">
            <p style="margin:0;color:#86efac;font-size:13px;line-height:1.6;">
              Please read the rules carefully and ensure all your players are aware of them before the tournament begins.
              Fair play, discipline, and respect must be maintained as per AFA standards.
            </p>
          </div>
          <p style="margin:0;color:#666;font-size:12px;">
            Tournament Date: <strong style="color:#f97316;">08 July 2026</strong> &nbsp;|&nbsp;
            Venue: <strong style="color:#fff;">Rongbong Ronghang Playground</strong>
          </p>
        """)
        rules_text = f"""Tournament Rules & Regulations — {TOURNAMENT_NAME}

Hi {manager_name},

Please find attached the official Rules & Regulations for the SSU Champions Trophy.

Tournament Date: 08 July 2026
Venue: Rongbong Ronghang Playground

Fair play, discipline, and respect must be maintained as per AFA standards.

© 2025 Shining Star United"""
        await _send(to_email, rules_subject, rules_html, rules_text,
                    rules_pdf_bytes, "SSU_Champions_Trophy_Rules_Regulations.pdf")



async def send_contact_notification(
    contact_name: str,
    contact_email: str,
    contact_phone: str,
    subject: str,
    message: str,
) -> None:
    """Send contact notification to admin."""
    admin_email = os.getenv("ADMIN_EMAIL", "admin@shiningstarunited.com")
    
    html_content = f"""
      <h2 style="margin:0 0 8px;color:#fff;font-size:20px;">📧 New Contact Message</h2>
      <p style="margin:0 0 24px;color:#aaa;font-size:14px;">
        A new message has been received from a player/team.
      </p>
      <div style="background:#111;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #2a2a2a;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;width:120px;">Name</td>
            <td style="padding:8px 0;color:#fff;font-size:13px;font-weight:600;">{contact_name}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Email</td>
            <td style="padding:8px 0;color:#f97316;font-size:13px;"><a href="mailto:{contact_email}" style="color:#f97316;text-decoration:none;">{contact_email}</a></td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Phone</td>
            <td style="padding:8px 0;color:#fff;font-size:13px;"><a href="tel:{contact_phone}" style="color:#fff;text-decoration:none;">{contact_phone}</a></td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Subject</td>
            <td style="padding:8px 0;color:#fff;font-size:13px;font-weight:600;">{subject}</td>
          </tr>
        </table>
      </div>
      <div style="background:#1c2a1c;border:1px solid #2d4a2d;border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 8px;color:#86efac;font-size:13px;font-weight:600;">Message:</p>
        <p style="margin:0;color:#aaa;font-size:13px;line-height:1.6;white-space:pre-wrap;">{message}</p>
      </div>
      <p style="margin:0;color:#666;font-size:12px;">
        Please reply to this message through the admin dashboard.
      </p>
    """

    text_content = f"""New Contact Message — {TOURNAMENT_NAME}

Name    : {contact_name}
Email   : {contact_email}
Phone   : {contact_phone}
Subject : {subject}

Message:
{message}

---
Please reply through the admin dashboard.

© 2025 Shining Star United"""

    await _send(admin_email, f"📧 New Contact: {subject}", _base_html(html_content), text_content)


async def send_contact_reply(
    to_email: str,
    contact_name: str,
    subject: str,
    admin_reply: str,
) -> None:
    """Send admin reply to contact message."""
    html_content = f"""
      <h2 style="margin:0 0 8px;color:#fff;font-size:20px;">✅ Reply to Your Message</h2>
      <p style="margin:0 0 24px;color:#aaa;font-size:14px;">
        Hi <strong style="color:#fff;">{contact_name}</strong>, we have replied to your message.
      </p>
      <div style="background:#111;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #2a2a2a;">
        <p style="margin:0 0 8px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Subject</p>
        <p style="margin:0 0 16px;color:#fff;font-size:14px;font-weight:600;">{subject}</p>
      </div>
      <div style="background:#1c2a1c;border:1px solid #2d4a2d;border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 8px;color:#86efac;font-size:13px;font-weight:600;">Admin Reply:</p>
        <p style="margin:0;color:#aaa;font-size:13px;line-height:1.6;white-space:pre-wrap;">{admin_reply}</p>
      </div>
      <p style="margin:0;color:#666;font-size:12px;">
        If you have any further questions, please contact us again through the contact form.
      </p>
    """

    text_content = f"""Reply to Your Message — {TOURNAMENT_NAME}

Hi {contact_name},

We have replied to your message regarding: {subject}

Admin Reply:
{admin_reply}

If you have further questions, please contact us again.

© 2025 Shining Star United"""

    await _send(to_email, f"✅ Reply: {subject}", _base_html(html_content), text_content)


async def send_player_recruitment_notification(
    player_name: str,
    player_email: str,
    player_phone: str,
    position: str,
    age: int,
    experience: int,
) -> None:
    """Send admin notification when player submits recruitment application."""
    admin_email = os.getenv("ADMIN_EMAIL", settings.SMTP_FROM)
    if not admin_email:
        logger.warning("ADMIN_EMAIL not set, skipping player recruitment notification")
        return

    html_content = f"""
      <h2 style="margin:0 0 8px;color:#fff;font-size:20px;">🆕 New Player Application</h2>
      <p style="margin:0 0 24px;color:#aaa;font-size:14px;">
        A new player has applied to join Shining Star United FC.
      </p>
      <div style="background:#111;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #2a2a2a;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;width:140px;">Player Name</td>
            <td style="padding:8px 0;color:#fff;font-size:13px;font-weight:600;">{player_name}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Email</td>
            <td style="padding:8px 0;color:#f97316;font-size:13px;">{player_email}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Phone</td>
            <td style="padding:8px 0;color:#fff;font-size:13px;">{player_phone}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Position</td>
            <td style="padding:8px 0;color:#fff;font-size:13px;text-transform:capitalize;">{position}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Age</td>
            <td style="padding:8px 0;color:#fff;font-size:13px;">{age} years</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Experience</td>
            <td style="padding:8px 0;color:#fff;font-size:13px;">{experience} years</td>
          </tr>
        </table>
      </div>
      <div style="background:#1c2a1c;border:1px solid #2d4a2d;border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;color:#86efac;font-size:13px;line-height:1.6;">
          <strong>Action Required:</strong> Review the application in the admin dashboard and update the status (Reviewed, Shortlisted, Rejected, or Accepted).
        </p>
      </div>
      <p style="margin:0;color:#666;font-size:12px;">
        Log in to the admin dashboard to view the complete application details.
      </p>
    """

    text_content = f"""New Player Application — {TOURNAMENT_NAME}

A new player has applied to join Shining Star United FC.

Player Name : {player_name}
Email       : {player_email}
Phone       : {player_phone}
Position    : {position}
Age         : {age} years
Experience  : {experience} years

Please review the application in the admin dashboard.

© 2025 Shining Star United"""

    await _send(admin_email, f"🆕 New Player Application: {player_name}", _base_html(html_content), text_content)


async def send_player_recruitment_status_update(
    to_email: str,
    player_name: str,
    position: str,
    status: str,
) -> None:
    """Send email to player when recruitment status is updated."""
    if status == "accepted":
        subject = f"🎉 Congratulations! You've Been Accepted to Shining Star United FC"
        status_badge = '<span style="background:#14532d;color:#4ade80;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;">Accepted</span>'
        status_message = f"""
          <h2 style="margin:0 0 8px;color:#4ade80;font-size:20px;">🎉 Welcome to SSU!</h2>
          <p style="margin:0 0 24px;color:#aaa;font-size:14px;">
            Congratulations <strong style="color:#fff;">{player_name}</strong>!
            Your application to join Shining Star United FC as a <strong style="color:#f97316;">{position}</strong>
            has been <strong style="color:#4ade80;">accepted</strong>!
          </p>
          <div style="background:#1c2a1c;border:1px solid #2d4a2d;border-radius:12px;padding:16px;margin-bottom:24px;">
            <p style="margin:0;color:#86efac;font-size:13px;line-height:1.6;">
              <strong>Next Steps:</strong><br/>
              Please contact the club management to finalize your joining. We're excited to have you on the team! ⚽
            </p>
          </div>
        """
        text_status = "ACCEPTED — Congratulations! You've been accepted to join Shining Star United FC."
    elif status == "shortlisted":
        subject = f"📋 You've Been Shortlisted - Shining Star United FC"
        status_badge = '<span style="background:#4c1d95;color:#d8b4fe;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;">Shortlisted</span>'
        status_message = f"""
          <h2 style="margin:0 0 8px;color:#d8b4fe;font-size:20px;">📋 Great News!</h2>
          <p style="margin:0 0 24px;color:#aaa;font-size:14px;">
            Hi <strong style="color:#fff;">{player_name}</strong>, your application for the position of
            <strong style="color:#f97316;">{position}</strong> has been <strong style="color:#d8b4fe;">shortlisted</strong>!
          </p>
          <div style="background:#2a1c3a;border:1px solid #4a2d5a;border-radius:12px;padding:16px;margin-bottom:24px;">
            <p style="margin:0;color:#e9d5ff;font-size:13px;line-height:1.6;">
              We're impressed with your profile. You'll hear from us soon with the next steps.
            </p>
          </div>
        """
        text_status = "SHORTLISTED — Great news! Your application has been shortlisted."
    elif status == "rejected":
        subject = f"Application Status - Shining Star United FC"
        status_badge = '<span style="background:#450a0a;color:#f87171;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;">Rejected</span>'
        status_message = f"""
          <h2 style="margin:0 0 8px;color:#f87171;font-size:20px;">Application Status</h2>
          <p style="margin:0 0 24px;color:#aaa;font-size:14px;">
            Hi <strong style="color:#fff;">{player_name}</strong>, thank you for applying to join Shining Star United FC.
            Unfortunately, your application for the position of <strong style="color:#f97316;">{position}</strong>
            has not been selected at this time.
          </p>
          <div style="background:#2a1c1c;border:1px solid #4a2d2d;border-radius:12px;padding:16px;margin-bottom:24px;">
            <p style="margin:0;color:#fca5a5;font-size:13px;line-height:1.6;">
              We encourage you to apply again in the future. Keep improving your skills! ⚽
            </p>
          </div>
        """
        text_status = "REJECTED — Thank you for applying. We encourage you to try again in the future."
    else:
        return

    html_content = f"""
      {status_message}
      <div style="background:#111;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #2a2a2a;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;width:140px;">Player Name</td>
            <td style="padding:8px 0;color:#fff;font-size:13px;font-weight:600;">{player_name}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Position</td>
            <td style="padding:8px 0;color:#fff;font-size:13px;text-transform:capitalize;">{position}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Status</td>
            <td style="padding:8px 0;">{status_badge}</td>
          </tr>
        </table>
      </div>
    """

    text_content = f"""Player Recruitment Status Update — {TOURNAMENT_NAME}

Hi {player_name},

{text_status}

Position: {position}
Status: {status.upper()}

© 2025 Shining Star United"""

    await _send(to_email, subject, _base_html(html_content), text_content)


async def send_registration_reminder_email(
    to_email: str,
    team_name: str,
    manager_name: str,
    registration_id: str,
    status: str,
) -> None:
    """Send reminder email to team manager to continue registration."""
    subject = f"📋 Registration Reminder — {team_name} | {TOURNAMENT_NAME}"
    
    status_message = ""
    if status == "pending":
        status_message = "Your team registration is still pending. Please submit your payment to complete the registration process."
    elif status == "payment_submitted":
        status_message = "We received your payment submission. Our team is reviewing it. Please wait for approval."
    else:
        status_message = "Please continue with your team registration process."
    
    html_content = f"""
      <h2 style="margin:0 0 8px;color:#fff;font-size:20px;">📋 Registration Reminder</h2>
      <p style="margin:0 0 24px;color:#aaa;font-size:14px;">
        Hi <strong style="color:#fff;">{manager_name}</strong>, this is a friendly reminder about your team registration.
      </p>
      <div style="background:#1c2a1c;border:1px solid #2d4a2d;border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;color:#86efac;font-size:13px;line-height:1.6;">
          <strong>Team:</strong> {team_name}<br/>
          <strong>Registration ID:</strong> {registration_id}<br/>
          <strong>Current Status:</strong> {status.upper()}
        </p>
      </div>
      <div style="background:#2a1c1c;border:1px solid #4a2d2d;border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;color:#fca5a5;font-size:13px;line-height:1.6;">
          {status_message}
        </p>
      </div>
      <p style="margin:0;color:#666;font-size:12px;">
        If you have any questions, please contact us through the support system.
      </p>
    """

    text_content = f"""Registration Reminder — {TOURNAMENT_NAME}

Hi {manager_name},

This is a friendly reminder about your team registration.

Team: {team_name}
Registration ID: {registration_id}
Current Status: {status.upper()}

{status_message}

If you have any questions, please contact us.

© 2025 Shining Star United"""

    await _send(to_email, subject, _base_html(html_content), text_content)
