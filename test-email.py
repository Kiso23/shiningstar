#!/usr/bin/env python3
"""
Quick SMTP connection test for Shining Star United
Tests if Brevo (or other) SMTP credentials are working correctly
"""
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# Load from .env file
load_dotenv('backend/.env')

# SMTP Configuration from environment
SMTP_HOST = os.getenv('SMTP_HOST', 'smtp-relay.brevo.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USER = os.getenv('SMTP_USER', 'your_email@example.com')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', 'your_smtp_key_here')
SMTP_FROM = os.getenv('SMTP_FROM', 'your_email@example.com')

def test_smtp_connection():
    """Test basic SMTP connection and authentication"""
    print("🔍 Testing SMTP connection...")
    print(f"   Host: {SMTP_HOST}:{SMTP_PORT}")
    print(f"   User: {SMTP_USER}")
    print(f"   From: {SMTP_FROM}")
    print()
    
    if not SMTP_HOST or SMTP_HOST == 'your_email@example.com':
        print("❌ SMTP not configured!")
        print()
        print("Please update backend/.env with your Brevo credentials:")
        print("  SMTP_HOST=smtp-relay.brevo.com")
        print("  SMTP_USER=your_brevo_email@example.com")
        print("  SMTP_PASSWORD=xsmtpsib-your_smtp_key")
        print("  SMTP_FROM=your_verified_sender@example.com")
        print()
        print("See BREVO-SETUP-GUIDE.md for detailed instructions.")
        return False
    
    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            print("✓ Connected to SMTP server")
            
            server.ehlo()
            print("✓ EHLO successful")
            
            server.starttls(context=context)
            print("✓ TLS encryption enabled")
            
            server.ehlo()
            
            server.login(SMTP_USER, SMTP_PASSWORD)
            print("✓ Authentication successful")
            
        print()
        print("✅ SMTP connection test PASSED!")
        print()
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print()
        print("❌ Authentication failed!")
        print(f"   Error: {e}")
        print()
        print("Possible causes:")
        print("  • App password is incorrect or expired")
        print("  • 2-factor authentication not enabled on Gmail")
        print("  • Account security settings blocking access")
        return False
        
    except smtplib.SMTPException as e:
        print()
        print("❌ SMTP error!")
        print(f"   Error: {e}")
        return False
        
    except Exception as e:
        print()
        print("❌ Connection failed!")
        print(f"   Error: {e}")
        print()
        print("Possible causes:")
        print("  • No internet connection")
        print("  • Firewall blocking port 587")
        print("  • SMTP host is incorrect")
        return False


def send_test_email(to_email: str):
    """Send a test email to verify full functionality"""
    print(f"📧 Sending test email to {to_email}...")
    print()
    
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "✅ Test Email - Shining Star United"
        msg["From"] = f"Shining Star United <{SMTP_FROM}>"
        msg["To"] = to_email
        
        text = """
Test Email - Shining Star United

This is a test email to verify SMTP configuration is working correctly.

If you received this email, the email service is functioning properly!

© 2026 Shining Star United
        """.strip()
        
        html = """
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#f5f5f5;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:white;padding:30px;border-radius:8px;">
    <h1 style="color:#ea580c;margin:0 0 20px;">✅ Test Email</h1>
    <p style="color:#333;line-height:1.6;">
      This is a test email to verify SMTP configuration is working correctly.
    </p>
    <p style="color:#333;line-height:1.6;">
      If you received this email, the email service is functioning properly!
    </p>
    <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
    <p style="color:#999;font-size:12px;margin:0;">
      © 2026 Shining Star United · Hamren
    </p>
  </div>
</body>
</html>
        """.strip()
        
        msg.attach(MIMEText(text, "plain"))
        msg.attach(MIMEText(html, "html"))
        
        # Send email
        context = ssl.create_default_context()
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls(context=context)
            server.ehlo()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, to_email, msg.as_string())
        
        print("✅ Test email sent successfully!")
        print(f"   Check inbox: {to_email}")
        print("   (Also check spam folder)")
        print()
        return True
        
    except Exception as e:
        print()
        print("❌ Failed to send test email!")
        print(f"   Error: {e}")
        print()
        return False


if __name__ == "__main__":
    print()
    print("=" * 60)
    print("  SMTP Test - Shining Star United")
    print("=" * 60)
    print()
    
    # Test connection
    if test_smtp_connection():
        print("─" * 60)
        print()
        
        # Ask if user wants to send test email
        response = input("Send a test email? (y/n): ").strip().lower()
        if response == 'y':
            email = input("Enter recipient email address: ").strip()
            if email:
                print()
                send_test_email(email)
            else:
                print("❌ No email address provided")
        else:
            print()
            print("Skipping test email send.")
    
    print()
    print("=" * 60)
    print()
