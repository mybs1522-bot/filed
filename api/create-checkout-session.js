import Stripe from 'stripe';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, interval, successUrl, cancelUrl } = req.body;

    // Find or create the product
    const products = await stripe.products.list({ limit: 20 });
    let product = products.data.find(p => p.name === 'FileDrive VIP');
    if (!product) {
      product = await stripe.products.create({
        name: 'FileDrive VIP',
        description: 'Unlimited High-Speed Direct Downloads',
      });
    }

    const cycle = interval === 'yearly' ? 'yearly' : 'monthly';
    const amount = cycle === 'yearly' ? 12000 : 1200; // $120/year or $12/month

    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'https://filedrive.cloud';
    const cleanEmail = email ? encodeURIComponent(String(email).trim()) : '';

    const sessionParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product: product.id,
            unit_amount: amount,
            recurring: {
              interval: cycle === 'yearly' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${origin}?stripe=success&cycle=${cycle}&email=${cleanEmail}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}?stripe=cancelled`,
      subscription_data: {
        description: `FileDrive VIP ${cycle === 'yearly' ? 'Annual ($120/yr)' : 'Monthly ($12/mo)'} Subscription`,
        metadata: {
          platform: 'FileDrive',
          product: 'High-Speed VIP Access',
          cycle: cycle,
          email: email || '',
        },
      },
    };

    if (email && typeof email === 'string' && email.includes('@')) {
      sessionParams.customer_email = email.trim();
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Stripe Checkout error:", error);
    res.status(400).json({ error: error.message });
  }
}
