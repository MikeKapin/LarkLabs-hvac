/**
 * Send Welcome Email - HVAC Jack 5.0 (Vercel Serverless Function)
 * Sends welcome email to new Pro subscribers via Resend
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, customerName } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const firstName = customerName ? customerName.split(' ')[0] : 'there';

    // Create welcome email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to HVAC Jack 5.0 Pro</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
        🎉 Welcome to HVAC Jack 5.0 Pro!
      </h1>
    </div>

    <!-- Main Content -->
    <div style="padding: 40px 30px;">

      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Hi ${firstName},
      </p>

      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Thank you for subscribing to <strong>HVAC Jack 5.0 Pro</strong>! Your payment has been processed successfully and your Pro access is now active.
      </p>

      <!-- Access Information Box -->
      <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-left: 4px solid #ef4444; padding: 20px; margin: 30px 0; border-radius: 8px;">
        <h3 style="color: #991b1b; margin-top: 0; margin-bottom: 15px; font-size: 18px;">
          ✅ Your Pro Access is Already Active!
        </h3>
        <p style="color: #7f1d1d; margin: 0; font-size: 15px; line-height: 1.6;">
          <strong>No activation code needed!</strong> When you returned to the app after payment, your Pro subscription was automatically activated in your browser. Simply return to the app to start using all Pro features.
        </p>
      </div>

      <!-- What's Included -->
      <h3 style="color: #1f2937; margin-top: 30px; margin-bottom: 15px; font-size: 20px;">
        What's Included in Your Pro Subscription:
      </h3>

      <ul style="color: #374151; font-size: 15px; line-height: 1.8; margin-bottom: 25px;">
        <li><strong>Unlimited AI Assistance</strong> - Ask as many HVAC questions as you need for 30 days</li>
        <li><strong>Advanced Photo Analysis</strong> - Upload equipment photos for AI-powered diagnostics</li>
        <li><strong>Rating Plate Reader</strong> - Instant equipment specification extraction</li>
        <li><strong>Equipment Database</strong> - Access comprehensive manufacturer data</li>
        <li><strong>24/7 Access</strong> - Work anytime, anywhere at your own pace</li>
        <li><strong>Priority Support</strong> - Get help when you need it</li>
      </ul>

      <!-- Quick Start -->
      <h3 style="color: #1f2937; margin-top: 30px; margin-bottom: 15px; font-size: 20px;">
        🚀 Quick Start Guide:
      </h3>

      <ol style="color: #374151; font-size: 15px; line-height: 1.8; margin-bottom: 25px;">
        <li>Return to <a href="https://hvac-jack-5-0.vercel.app" style="color: #ef4444; text-decoration: none;">hvac-jack-5-0.vercel.app</a></li>
        <li>You'll see your Pro status displayed at the top of the app</li>
        <li>Start analyzing equipment or ask the AI assistant any HVAC question!</li>
      </ol>

      <!-- Important Note -->
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 8px;">
        <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
          <strong>⚠️ Important:</strong> Your Pro access is stored in your browser. If you clear your browser data or use a different device, you may need to contact support to restore your access. We recommend bookmarking the app for easy access.
        </p>
      </div>

      <!-- Support -->
      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-top: 30px; margin-bottom: 10px;">
        <strong>Need Help?</strong>
      </p>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 0;">
        If you have any questions or issues accessing your Pro features, please contact us at <a href="mailto:support@larklabs.org" style="color: #ef4444; text-decoration: none;">support@larklabs.org</a>
      </p>

      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 30px; margin-bottom: 5px;">
        Happy troubleshooting!
      </p>
      <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin-top: 0;">
        The LARK Labs Team
      </p>

    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 13px; margin: 0 0 10px 0;">
        This email was sent to ${email} because you subscribed to HVAC Jack 5.0 Pro
      </p>
      <p style="color: #9ca3af; font-size: 13px; margin: 0;">
        <a href="https://larklabs.org" style="color: #6b7280; text-decoration: none;">LARK Labs</a> |
        <a href="mailto:support@larklabs.org" style="color: #6b7280; text-decoration: none;">Support</a>
      </p>
    </div>

  </div>
</body>
</html>
    `;

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'LARK Labs <onboarding@resend.dev>',
        to: email,
        subject: 'Welcome to HVAC Jack 5.0 Pro - You\'re All Set! 🎉',
        html: emailHtml
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return res.status(response.status).json({
        error: 'Failed to send email',
        details: data
      });
    }

    console.log('Welcome email sent successfully:', { email, messageId: data.id });

    return res.status(200).json({
      success: true,
      message: 'Welcome email sent successfully',
      messageId: data.id
    });

  } catch (error) {
    console.error('Error sending welcome email:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
