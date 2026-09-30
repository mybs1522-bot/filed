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

    const amount = interval === 'yearly' ? 12000 : 1200; // $120/year or $12/month

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product: product.id,
            unit_amount: amount,
            recurring: {
              interval: interval === 'yearly' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${req.headers.origin || 'http://localhost:5173'}?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin || 'http://localhost:5173'}?stripe=cancelled`,
      subscription_data: {
        metadata: {
          platform: 'FileDrive',
          product: 'High-Speed VIP Access',
        },
      },
    });

    res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Stripe Checkout error:", error);
    res.status(400).json({ error: error.message });
  }
};
