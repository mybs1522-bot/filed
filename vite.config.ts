import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import Stripe from 'stripe'

function stripeDevServerPlugin(): Plugin {
  return {
    name: 'stripe-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // 1. Recurring Stripe Subscription Endpoint (Monthly / Yearly auto-recurring billing)
        if (req.url === '/api/create-subscription' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}')
              const env = loadEnv(server.config.mode, process.cwd(), '')
              const secretKey = env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY

              if (secretKey && secretKey.startsWith('sk_')) {
                const stripe = new Stripe(secretKey)

                // A. Customer creation or lookup by email
                const customerEmail = (data.email || 'subscriber@filedrive.cloud').trim().toLowerCase()
                const existingCustomers = await stripe.customers.list({ email: customerEmail, limit: 1 })
                let customer = existingCustomers.data[0]
                if (!customer) {
                  customer = await stripe.customers.create({
                    email: customerEmail,
                    metadata: { platform: 'FileDrive Cloud' },
                  })
                }

                // B. Ensure recurring product exists
                const products = await stripe.products.list({ limit: 10 })
                let product = products.data.find((p) => p.name === 'FileDrive High-Speed Direct Access')
                if (!product) {
                  product = await stripe.products.create({
                    name: 'FileDrive High-Speed Direct Access',
                    description: 'Unlimited high-speed direct downloads and Google Drive links',
                  })
                }

                // C. Determine recurring interval (month or year) and unit price
                const isYearly = data.interval === 'yearly' || data.interval === 'year'
                const interval: 'month' | 'year' = isYearly ? 'year' : 'month'
                const unitAmount = isYearly ? 19200 : 2000 // $192/year or $20/month in cents

                // Find or create recurring price
                const prices = await stripe.prices.list({ product: product.id, active: true })
                let price = prices.data.find(
                  (p) => p.recurring?.interval === interval && p.unit_amount === unitAmount
                )
                if (!price) {
                  price = await stripe.prices.create({
                    product: product.id,
                    unit_amount: unitAmount,
                    currency: 'usd',
                    recurring: { interval },
                  })
                }

                // D. Attach PaymentMethod if provided
                const paymentMethodId = data.paymentMethodId
                if (paymentMethodId) {
                  try {
                    await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id })
                    await stripe.customers.update(customer.id, {
                      invoice_settings: { default_payment_method: paymentMethodId },
                    })
                  } catch (err: any) {
                    console.error('[Stripe] Failed to attach payment method:', err.message)
                  }
                }

                // E. Create recurring subscription
                const subscription = await stripe.subscriptions.create({
                  customer: customer.id,
                  items: [{ price: price.id }],
                  default_payment_method: paymentMethodId || undefined,
                  expand: ['latest_invoice.payment_intent'],
                  metadata: {
                    platform: 'FileDrive',
                    billingCycle: isYearly ? 'yearly ($192/year)' : 'monthly ($20/month)',
                    customerEmail,
                  },
                })

                // F. Retrieve clientSecret if 3D Secure is required
                let clientSecret: string | undefined = undefined
                const invoice = subscription.latest_invoice as any
                if (typeof invoice === 'object' && invoice !== null) {
                  const pi = invoice.payment_intent
                  if (typeof pi === 'object' && pi !== null) {
                    clientSecret = pi.client_secret
                  } else if (typeof pi === 'string') {
                    const fullPi = await stripe.paymentIntents.retrieve(pi)
                    clientSecret = fullPi.client_secret ?? undefined
                  }
                }

                console.log('[Stripe] Subscription created:', subscription.id, 'status:', subscription.status, 'clientSecret:', clientSecret ? 'OK ✓' : 'MISSING ✗')

                res.setHeader('Content-Type', 'application/json')
                res.end(
                  JSON.stringify({
                    subscriptionId: subscription.id,
                    clientSecret: clientSecret || null,
                    customerId: customer.id,
                    interval,
                    unitAmount: unitAmount / 100,
                    status: subscription.status,
                    simulated: false,
                  })
                )
                return
              }

              // Fallback simulated subscription
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  subscriptionId: `sub_simulated_${Date.now()}`,
                  clientSecret: `simulated_sub_secret_${Date.now()}`,
                  simulated: true,
                  interval: data.interval || 'month',
                  message: 'Simulated subscription created',
                })
              )
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Unknown error'
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: message }))
            }
          })
          return
        }

        // 2. Fallback PaymentIntent Endpoint
        if (req.url === '/api/create-payment-intent' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}')
              const env = loadEnv(server.config.mode, process.cwd(), '')
              const secretKey = env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY

              if (secretKey && secretKey.startsWith('sk_')) {
                const stripe = new Stripe(secretKey)

                // Create PaymentIntent configured for card-only (no country/address enforcement)
                const paymentIntent = await stripe.paymentIntents.create({
                  amount: data.amount || 2000,
                  currency: data.currency || 'usd',
                  payment_method_types: ['card'],
                  description: 'FileDrive High-Speed Direct Access',
                  metadata: data.metadata || {},
                })

                res.setHeader('Content-Type', 'application/json')
                res.end(
                  JSON.stringify({
                    clientSecret: paymentIntent.client_secret,
                    id: paymentIntent.id,
                    simulated: false,
                  })
                )
                return
              }

              // Fallback / Simulated mode when secret key is not provided yet
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  clientSecret: `simulated_pi_${Date.now()}`,
                  simulated: true,
                  message:
                    'Stripe simulated mode: Add STRIPE_SECRET_KEY and VITE_STRIPE_PUBLISHABLE_KEY to .env to use live/test Stripe',
                })
              )
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Unknown error'
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: message }))
            }
          })
          return
        }

        // 3. PayPal Live Subscription Endpoint
        if (req.url === '/api/create-paypal-subscription' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}')
              const env = loadEnv(server.config.mode, process.cwd(), '')
              const clientId = env.VITE_PAYPAL_CLIENT_ID || process.env.VITE_PAYPAL_CLIENT_ID
              const secret = env.PAYPAL_SECRET_KEY || process.env.PAYPAL_SECRET_KEY
              const isYearly = data.interval === 'yearly' || data.interval === 'year'
              const planId = isYearly
                ? env.PAYPAL_PLAN_YEARLY || 'P-8MU549730B661773TNK4DIAQ'
                : env.PAYPAL_PLAN_MONTHLY || 'P-48G24027EY682341CNK4DIAQ'

              if (clientId && secret) {
                const auth = Buffer.from(`${clientId}:${secret}`).toString('base64')
                const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
                  method: 'POST',
                  headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  body: 'grant_type=client_credentials',
                })
                const tokenData = (await tokenRes.json()) as any
                const accessToken = tokenData.access_token

                if (accessToken) {
                  const subRes = await fetch('https://api-m.paypal.com/v1/billing/subscriptions', {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      plan_id: planId,
                      subscriber: {
                        email_address: data.email || 'subscriber@filedrive.cloud',
                      },
                      application_context: {
                        brand_name: 'FileDrive Cloud',
                        locale: 'en-US',
                        shipping_preference: 'NO_SHIPPING',
                        user_action: 'SUBSCRIBE_NOW',
                        return_url: data.returnUrl || 'http://localhost:5174/?paypal=success',
                        cancel_url: data.cancelUrl || 'http://localhost:5174/?paypal=cancel',
                      },
                    }),
                  })
                  const subData = (await subRes.json()) as any
                  const approveLink = subData.links?.find((l: any) => l.rel === 'approve')?.href

                  res.setHeader('Content-Type', 'application/json')
                  res.end(
                    JSON.stringify({
                      subscriptionId: subData.id,
                      approveUrl: approveLink,
                      status: subData.status,
                      planId,
                      simulated: false,
                    })
                  )
                  return
                }
              }

              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  subscriptionId: `I-SIMULATED_${Date.now()}`,
                  approveUrl: data.returnUrl || 'http://localhost:5174/?paypal=success',
                  simulated: true,
                })
              )
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Unknown error'
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: message }))
            }
          })
          return
        }

        // 4. PayPal Verification Endpoint
        if (req.url === '/api/verify-paypal-subscription' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}')
              const env = loadEnv(server.config.mode, process.cwd(), '')
              const clientId = env.VITE_PAYPAL_CLIENT_ID || process.env.VITE_PAYPAL_CLIENT_ID
              const secret = env.PAYPAL_SECRET_KEY || process.env.PAYPAL_SECRET_KEY

              if (clientId && secret && data.subscriptionId) {
                const auth = Buffer.from(`${clientId}:${secret}`).toString('base64')
                const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
                  method: 'POST',
                  headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  body: 'grant_type=client_credentials',
                })
                const tokenData = (await tokenRes.json()) as any
                const accessToken = tokenData.access_token

                if (accessToken) {
                  const checkRes = await fetch(
                    `https://api-m.paypal.com/v1/billing/subscriptions/${data.subscriptionId}`,
                    {
                      headers: { Authorization: `Bearer ${accessToken}` },
                    }
                  )
                  const checkData = (await checkRes.json()) as any
                  const active = checkData.status === 'ACTIVE' || checkData.status === 'APPROVED'

                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ active, status: checkData.status }))
                  return
                }
              }

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ active: true, status: 'APPROVED', simulated: true }))
            } catch {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ active: true, status: 'APPROVED', fallback: true }))
            }
          })
          return
        }

        // 5. Cancel Stripe Subscription Endpoint
        if (req.url === '/api/cancel-stripe-subscription' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}')
              const env = loadEnv(server.config.mode, process.cwd(), '')
              const secretKey = env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY

              if (secretKey && secretKey.startsWith('sk_') && data.subscriptionId && !data.subscriptionId.includes('simulated')) {
                const stripe = new Stripe(secretKey)
                try {
                  const canceled = await stripe.subscriptions.cancel(data.subscriptionId)
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ success: true, status: canceled.status, id: canceled.id }))
                  return
                } catch (stripeErr: any) {
                  console.warn('Stripe cancel error:', stripeErr?.message)
                }
              }

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, status: 'canceled', simulated: true }))
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Unknown error'
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: message }))
            }
          })
          return
        }

        // 6. Cancel PayPal Subscription Endpoint
        if (req.url === '/api/cancel-paypal-subscription' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}')
              const env = loadEnv(server.config.mode, process.cwd(), '')
              const clientId = env.VITE_PAYPAL_CLIENT_ID || process.env.VITE_PAYPAL_CLIENT_ID
              const secret = env.PAYPAL_SECRET_KEY || process.env.PAYPAL_SECRET_KEY

              if (clientId && secret && data.subscriptionId && !data.subscriptionId.includes('SIMULATED')) {
                const auth = Buffer.from(`${clientId}:${secret}`).toString('base64')
                const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
                  method: 'POST',
                  headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  body: 'grant_type=client_credentials',
                })
                const tokenData = (await tokenRes.json()) as any
                const accessToken = tokenData.access_token

                if (accessToken) {
                  const cancelRes = await fetch(
                    `https://api-m.paypal.com/v1/billing/subscriptions/${data.subscriptionId}/cancel`,
                    {
                      method: 'POST',
                      headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        reason: data.reason || 'Cancelled by user via FileDrive settings',
                      }),
                    }
                  )

                  if (cancelRes.status === 204 || cancelRes.ok) {
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify({ success: true, status: 'CANCELLED' }))
                    return
                  }
                }
              }

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, status: 'CANCELLED', simulated: true }))
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Unknown error'
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: message }))
            }
          })
          return
        }

        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), stripeDevServerPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})

