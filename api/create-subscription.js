import Stripe from 'stripe';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, interval, paymentMethodId } = req.body;

    // 1. Create or find customer
    const customer = await stripe.customers.create({
      email: email || "customer@filedrive.cloud",
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // 2. Find or create the product
    const amount = interval === 'yearly' ? 12000 : 1200;
    const products = await stripe.products.list({ limit: 20 });
    let product = products.data.find(p => p.name === 'FileDrive VIP');
    if (!product) {
      product = await stripe.products.create({ name: 'FileDrive VIP' });
    }

    // 3. Create subscription with payment_behavior set to default_incomplete
    //    so we always get a PaymentIntent back that we can confirm on the frontend
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price_data: {
            currency: 'usd',
            product: product.id,
            unit_amount: amount,
            recurring: {
              interval: interval === 'yearly' ? 'year' : 'month',
            },
          },
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    // 4. Safely extract the client_secret
    const latestInvoice = subscription.latest_invoice;
    const paymentIntent = latestInvoice?.payment_intent;
    const clientSecret = paymentIntent?.client_secret || null;

    res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret: clientSecret,
      status: subscription.status,
      customerId: customer.id,
    });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(400).json({ error: error.message });
  }
};
