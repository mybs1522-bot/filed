import Stripe from 'stripe';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, interval, successUrl, cancelUrl } = req.body;

    const cycle = interval === 'yearly' ? 'yearly' : 'monthly';
    const amount = cycle === 'yearly' ? 12000 : 1200; // $120/year or $12/month
    const productName = cycle === 'yearly' ? 'FileDrive VIP (Annual)' : 'FileDrive VIP';

    const marketingFeatures = [
      {
        name: cycle === 'yearly'
          ? 'Unlimited High Speed Downloads For Year'
          : 'Unlimited High Speed Downloads For Month',
      },
      { name: 'Direct instant start (Zero wait time)' },
      { name: 'Est. Time for 4.18 GB: ~45 Seconds' },
      { name: 'Full resume capability + multi-thread chunking' },
      { name: 'Official high-speed CDN mirrors' },
    ];

    // Find or create the product with the exact marketing features for Stripe checkout display
    const products = await stripe.products.list({ limit: 20 });
    let product = products.data.find(p => p.name === productName);
    if (!product && cycle === 'monthly') {
      product = products.data.find(p => p.name === 'FileDrive VIP');
    }

    if (product) {
      try {
        product = await stripe.products.update(product.id, {
          name: productName,
          description: 'Unlimited High Speed Downloads • Direct instant start (Zero wait time)',
          marketing_features: marketingFeatures,
        });
      } catch (err) {
        console.warn("Could not update product features:", err);
      }
    } else {
      product = await stripe.products.create({
        name: productName,
        description: 'Unlimited High Speed Downloads • Direct instant start (Zero wait time)',
        marketing_features: marketingFeatures,
      });
    }

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
