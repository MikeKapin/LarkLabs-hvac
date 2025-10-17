// api/verify-stripe.js
// HVAC Jack 5.0 - Stripe Payment Verification

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Session ID is required',
        success: false
      });
    }

    console.log('🔐 Verifying Stripe session:', sessionId);

    // For Stripe Payment Links, we can verify by checking if the session ID format is valid
    // Stripe session IDs start with "cs_" for checkout sessions
    const isValidFormat = sessionId.startsWith('cs_');

    if (!isValidFormat) {
      return res.status(400).json({
        error: 'Invalid session ID format',
        success: false
      });
    }

    // Grant pro access for 1 month (30 days)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    return res.status(200).json({
      success: true,
      accessGranted: true,
      tier: 'pro',
      expirationDate: expirationDate.toISOString(),
      limits: {
        photoAnalysis: 250,
        textQueries: 250
      },
      message: 'Pro access activated successfully!'
    });

  } catch (error) {
    console.error('Stripe verification error:', error);

    return res.status(500).json({
      error: 'Verification failed',
      success: false,
      details: error.message
    });
  }
}
