import Stripe from 'stripe';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, interval, paymentMethodId } = req.body;
    
    // Create customer
    const customer = await stripe.customers.create({
      email: email || "customer@filedrive.cloud",
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription - if you don't have explicit Price IDs, this could be tricky. 
    // We can create a price on the fly or charge a one-time payment.
    // Let's create a product and price on the fly for simplicity.
    const amount = interval === 'yearly' ? 12000 : 1200;
    
    // Create subscription using a dynamic price (inline)
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'FileDrive High-Speed Direct Access VIP',
            },
            unit_amount: amount,
            recurring: {
              interval: interval === 'yearly' ? 'year' : 'month',
            },
          },
        },
      ],
      expand: ['latest_invoice.payment_intent'],
    });

    res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(400).json({ error: error.message });
  }
};
