/**
 * PayPal Client Service
 * Handles PayPal subscription creation, approval redirection, and instant activation.
 */

export interface CreatePayPalSubscriptionResponse {
  subscriptionId?: string;
  approveUrl?: string;
  error?: string;
  simulated?: boolean;
}

/**
 * Creates a recurring PayPal subscription on the backend.
 */
export async function createPayPalSubscription(
  email: string,
  interval: "monthly" | "yearly" = "monthly"
): Promise<CreatePayPalSubscriptionResponse> {
  try {
    const returnUrl = `${window.location.origin}/?paypal=success`;
    const cancelUrl = `${window.location.origin}/?paypal=cancel`;

    const res = await fetch("/api/create-paypal-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email || "subscriber@filedrive.cloud",
        interval,
        returnUrl,
        cancelUrl,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      try {
        const errJson = JSON.parse(errText);
        return { error: errJson.error || "Failed to create PayPal subscription" };
      } catch {
        return { error: errText || "Server error creating PayPal subscription" };
      }
    }

    return await res.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return {
      simulated: true,
      subscriptionId: `I-SIMULATED_${Date.now()}`,
      error: undefined,
    };
  }
}

/**
 * Verifies an active PayPal subscription status.
 */
export async function verifyPayPalSubscription(subscriptionId: string): Promise<boolean> {
  try {
    const res = await fetch("/api/verify-paypal-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!res.ok) return false;
    const data = await res.json();
    return data.active || data.status === "ACTIVE" || data.status === "APPROVED";
  } catch {
    return false;
  }
}
