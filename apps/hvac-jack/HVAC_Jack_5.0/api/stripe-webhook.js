/**
 * Stripe Webhook - HVAC Jack 5.0 (Vercel Serverless Function)
 * Handles Stripe checkout.session.completed events and sends welcome emails
 */

import Stripe from 'stripe';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Disable body parser so we can get raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    if (!STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(buf.toString(), sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const customerEmail = session.customer_email || session.customer_details?.email;
      const customerName = session.customer_details?.name;

      if (!customerEmail) {
        console.error('No customer email in session:', session.id);
        return res.status(400).json({ error: 'No customer email found' });
      }

      console.log('Processing successful checkout:', {
        sessionId: session.id,
        email: customerEmail,
        name: customerName
      });

      // Determine the base URL (use Vercel URL or custom domain)
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'https://hvac-jack-5-0.vercel.app';

      // Call send-welcome-email function
      try {
        const emailResponse = await fetch(`${baseUrl}/api/send-welcome-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: customerEmail,
            customerName: customerName
          })
        });

        const emailData = await emailResponse.json();

        if (!emailResponse.ok) {
          console.error('Failed to send welcome email:', emailData);
          // Don't fail the webhook - just log the error
        } else {
          console.log('Welcome email sent successfully:', emailData);
        }
      } catch (emailError) {
        console.error('Error calling send-welcome-email:', emailError);
        // Don't fail the webhook - just log the error
      }
    }

    // Return 200 to acknowledge receipt of the webhook
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
