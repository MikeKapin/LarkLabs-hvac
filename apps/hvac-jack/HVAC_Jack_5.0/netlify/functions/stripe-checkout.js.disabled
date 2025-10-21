// netlify/functions/stripe-checkout.js
// HVAC Jack 4.0 - Stripe Payment Integration

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { action, userId, priceId, tierId, email } = JSON.parse(event.body || '{}');

    switch (action) {
      case 'create-checkout':
        return await createCheckoutSession(userId, priceId, tierId, email, headers);

      case 'create-portal':
        return await createPortalSession(userId, headers);

      case 'webhook':
        return await handleWebhook(event, headers);

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

// Create Stripe Checkout Session
async function createCheckoutSession(userId, priceId, tierId, email, headers) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL}/pricing`,
      customer_email: email,
      client_reference_id: userId,
      metadata: {
        userId: userId,
        tierId: tierId
      },
      subscription_data: {
        metadata: {
          userId: userId,
          tierId: tierId
        }
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        sessionId: session.id,
        url: session.url
      })
    };

  } catch (error) {
    console.error('Create checkout session error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create checkout session' })
    };
  }
}

// Create Customer Portal Session
async function createPortalSession(userId, headers) {
  try {
    // Get user's Stripe customer ID from database
    const { data: user, error } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (error || !user.stripe_customer_id) {
      throw new Error('Customer not found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.URL}/account`,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        url: session.url
      })
    };

  } catch (error) {
    console.error('Create portal session error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create portal session' })
    };
  }
}

// Handle Stripe Webhooks
async function handleWebhook(event, headers) {
  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Webhook signature verification failed' })
    };
  }

  // Handle different event types
  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripeEvent.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(stripeEvent.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(stripeEvent.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('Webhook handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Webhook handler failed' })
    };
  }
}

// Webhook event handlers
async function handleCheckoutCompleted(session) {
  const userId = session.client_reference_id || session.metadata.userId;
  const tierId = session.metadata.tierId;
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  // Update user record with Stripe customer ID and subscription
  await supabase
    .from('users')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_tier: tierId.toUpperCase(),
      subscription_status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  // Initialize usage record if doesn't exist
  const { data: existingUsage } = await supabase
    .from('usage')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!existingUsage) {
    await supabase
      .from('usage')
      .insert({
        user_id: userId,
        textQueries: 0,
        photoAnalysis: 0,
        explainerQueries: 0,
        period_start: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
  }

  console.log(`Checkout completed for user ${userId}, tier: ${tierId}`);
}

async function handleSubscriptionCreated(subscription) {
  const userId = subscription.metadata.userId;
  const tierId = subscription.metadata.tierId;

  await supabase
    .from('users')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_tier: tierId.toUpperCase(),
      subscription_status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  console.log(`Subscription created for user ${userId}`);
}

async function handleSubscriptionUpdated(subscription) {
  const userId = subscription.metadata.userId;

  // Get new tier from subscription items
  const priceId = subscription.items.data[0].price.id;
  const tierMap = {
    [process.env.STRIPE_PRICE_PRO]: 'PRO',
    [process.env.STRIPE_PRICE_PREMIUM]: 'PREMIUM',
    [process.env.STRIPE_PRICE_BUSINESS]: 'BUSINESS'
  };
  const newTier = tierMap[priceId] || 'FREE';

  await supabase
    .from('users')
    .update({
      subscription_tier: newTier,
      subscription_status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  console.log(`Subscription updated for user ${userId}, new tier: ${newTier}`);
}

async function handleSubscriptionDeleted(subscription) {
  const userId = subscription.metadata.userId;

  await supabase
    .from('users')
    .update({
      subscription_tier: 'FREE',
      subscription_status: 'canceled',
      stripe_subscription_id: null,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  console.log(`Subscription canceled for user ${userId}, downgraded to FREE`);
}

async function handlePaymentSucceeded(invoice) {
  const subscriptionId = invoice.subscription;
  const customerId = invoice.customer;

  // Reset monthly usage when payment succeeds
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (user) {
    await supabase
      .from('usage')
      .update({
        textQueries: 0,
        photoAnalysis: 0,
        explainerQueries: 0,
        period_start: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    console.log(`Payment succeeded and usage reset for user ${user.id}`);
  }
}

async function handlePaymentFailed(invoice) {
  const customerId = invoice.customer;

  const { data: user } = await supabase
    .from('users')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single();

  if (user) {
    await supabase
      .from('users')
      .update({
        subscription_status: 'past_due',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    console.log(`Payment failed for user ${user.id}`);
    // TODO: Send email notification about failed payment
  }
}
