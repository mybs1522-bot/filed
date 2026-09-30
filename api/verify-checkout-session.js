import Stripe from 'stripe';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id parameter' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription', 'customer'],
    });

    const email = session.customer_details?.email || session.customer?.email || '';
    const paymentStatus = session.payment_status;
    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id || '';

    return res.status(200).json({
      email,
      paymentStatus,
      subscriptionId,
      status: session.status,
    });
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    return res.status(400).json({ error: error.message });
  }
}
