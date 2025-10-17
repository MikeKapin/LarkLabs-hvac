// api/validate-student-code.js
// HVAC Jack 5.0 - Student Access Code Validation

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
    const { accessCode } = req.body;

    if (!accessCode || typeof accessCode !== 'string') {
      return res.status(400).json({
        error: 'Access code is required',
        success: false
      });
    }

    console.log('🎓 Validating student access code:', accessCode);

    // Validate student access codes (LARK0001 through LARK0080)
    const codeNumber = parseInt(accessCode.replace('LARK', ''));
    const isValidCode = accessCode.match(/^LARK\d{4}$/) && codeNumber >= 1 && codeNumber <= 80;

    if (!isValidCode) {
      return res.status(401).json({
        error: 'Invalid access code',
        success: false,
        message: 'Please enter a valid student access code (LARK0001-LARK0080)'
      });
    }

    // Grant student pro access for 12 months (365 days)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 365);

    return res.status(200).json({
      success: true,
      accessGranted: true,
      tier: 'student',
      expirationDate: expirationDate.toISOString(),
      limits: {
        photoAnalysis: 250,
        textQueries: 250
      },
      message: 'Student access activated for 12 months!',
      accessCode: accessCode
    });

  } catch (error) {
    console.error('Student code validation error:', error);

    return res.status(500).json({
      error: 'Validation failed',
      success: false,
      details: error.message
    });
  }
}
