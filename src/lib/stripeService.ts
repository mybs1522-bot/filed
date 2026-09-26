import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Returns the configured Stripe Publishable Key, checking environment variables
 * or local storage override.
 */
export function getStripePublishableKey(): string {
  if (typeof window !== "undefined") {
    const localKey = localStorage.getItem("filedrive_stripe_pk");
    if (localKey && localKey.trim().startsWith("pk_")) {
      return localKey.trim();
    }
  }

  const envKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (envKey && typeof envKey === "string" && envKey.trim().startsWith("pk_")) {
    return envKey.trim();
  }

  return "";
}

/**
 * Returns true if a valid Stripe Publishable Key starting with 'pk_' is provided.
 */
export function isStripeConfigured(): boolean {
  const pk = getStripePublishableKey();
  return Boolean(pk && pk.startsWith("pk_") && pk.length > 20);
}

/**
 * Retrieves the singleton Stripe instance.
 */
export function getStripeInstance(): Promise<Stripe | null> {
  const pk = getStripePublishableKey();
  if (!pk) {
    return Promise.resolve(null);
  }

  if (!stripePromise) {
    stripePromise = loadStripe(pk);
  }
  return stripePromise;
}

/**
 * Reset Stripe instance (e.g. when user updates keys)
 */
export function resetStripeInstance(): void {
  stripePromise = null;
}

/**
 * Backend API response structure from /api/create-payment-intent
 */
export interface PaymentIntentResponse {
  clientSecret?: string;
  simulated?: boolean;
  error?: string;
  id?: string;
}

/**
 * Request creation of a PaymentIntent on the backend.
 * Configured specifically for card-only transactions (zero country/address fields).
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = "usd"
): Promise<PaymentIntentResponse> {
  try {
    const response = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // convert to cents
        currency,
        metadata: {
          platform: "FileDrive",
          product: "FileDrive High-Speed Direct Access",
          amount: `$${amount.toFixed(2)}`,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      try {
        const errJson = JSON.parse(errText);
        return { error: errJson.error || "Failed to create payment intent" };
      } catch {
        return { error: errText || "Server error creating payment intent" };
      }
    }

    return await response.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    // Fallback if backend API is unavailable or offline
    return {
      simulated: true,
      clientSecret: `simulated_secret_${Date.now()}`,
      error: undefined,
    };
  }
}

export interface SubscriptionResponse {
  subscriptionId?: string;
  clientSecret?: string;
  customerId?: string;
  interval?: "month" | "year";
  unitAmount?: number;
  simulated?: boolean;
  error?: string;
  status?: string;
}

/**
 * Creates a recurring subscription on Stripe (charges monthly or yearly).
 */
export async function createSubscription(
  email: string,
  interval: "monthly" | "yearly" = "monthly",
  paymentMethodId?: string
): Promise<SubscriptionResponse> {
  try {
    const response = await fetch("/api/create-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email || "customer@filedrive.cloud",
        interval,
        paymentMethodId,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      try {
        const errJson = JSON.parse(errText);
        return { error: errJson.error || "Failed to create subscription" };
      } catch {
        return { error: errText || "Server error creating subscription" };
      }
    }

    return await response.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return {
      simulated: true,
      subscriptionId: `sub_simulated_${Date.now()}`,
      interval: interval === "yearly" ? "year" : "month",
      error: undefined,
    };
  }
}


