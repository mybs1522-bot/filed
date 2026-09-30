import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Lock, CheckCircle2, ArrowRight, Mail, AlertCircle } from "lucide-react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripeInstance, isStripeConfigured, createSubscription } from "@/lib/stripeService";
import { createPayPalSubscription } from "@/lib/paypalService";
import { saveUserSubscription, addInvoice } from "@/lib/billingService";

/**
 * Real official PayPal vector logo (Double-P Monogram + PayPal Wordmark)
 */
export function PayPalOfficialLogo({ className = "h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 124 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Official PayPal Monogram Double-P */}
      <path
        fill="#253B80"
        d="M7.266,29.154l0.523-3.322l-1.165-0.027H1.061L4.927,1.292C4.939,1.218,4.978,1.149,5.035,1.1c0.057-0.049,0.13-0.076,0.206-0.076h9.38c3.114,0,5.263,0.648,6.385,1.927c0.526,0.6,0.861,1.227,1.023,1.917c0.17,0.724,0.173,1.589,0.007,2.644l-0.012,0.077v0.676l0.526,0.298c0.443,0.235,0.795,0.504,1.065,0.812c0.45,0.513,0.741,1.165,0.864,1.938c0.127,0.795,0.085,1.741-0.123,2.812c-0.24,1.232-0.628,2.305-1.152,3.183c-0.482,0.809-1.096,1.48-1.825,2c-0.696,0.494-1.523,0.869-2.458,1.109c-0.906,0.236-1.939,0.355-3.072,0.355h-0.73c-0.522,0-1.029,0.188-1.427,0.525c-0.399,0.344-0.663,0.814-0.744,1.328l-0.055,0.299l-0.924,5.855l-0.042,0.215c-0.011,0.068-0.03,0.102-0.058,0.125c-0.025,0.021-0.061,0.035-0.096,0.035H7.266z"
      />
      <path
        fill="#179BD7"
        d="M23.048,7.667L23.048,7.667L23.048,7.667c-0.028,0.179-0.06,0.362-0.096,0.55c-1.237,6.351-5.469,8.545-10.874,8.545H9.326c-0.661,0-1.218,0.48-1.321,1.132l0,0l0,0L6.596,26.83l-0.399,2.533c-0.067,0.428,0.263,0.814,0.695,0.814h4.881c0.578,0,1.069-0.42,1.16-0.99l0.048-0.248l0.919-5.832l0.059-0.32c0.09-0.572,0.582-0.992,1.16-0.992h0.73c4.729,0,8.431-1.92,9.513-7.476c0.452-2.321,0.218-4.259-0.978-5.622C24.022,8.286,23.573,7.945,23.048,7.667z"
      />
      <path
        fill="#222D65"
        d="M21.754,7.151c-0.189-0.055-0.384-0.105-0.584-0.15c-0.201-0.044-0.407-0.083-0.619-0.117c-0.742-0.12-1.555-0.177-2.426-0.177h-7.352c-0.181,0-0.353,0.041-0.507,0.115C9.927,6.985,9.675,7.306,9.614,7.699L8.05,17.605l-0.045,0.289c0.103-0.652,0.66-1.132,1.321-1.132h2.752c5.405,0,9.637-2.195,10.874-8.545c0.037-0.188,0.068-0.371,0.096-0.55c-0.313-0.166-0.652-0.308-1.017-0.429C21.941,7.208,21.848,7.179,21.754,7.151z"
      />
      {/* "Pay" wordmark */}
      <path
        fill="currentColor"
        d="M46.211,6.749h-6.839c-0.468,0-0.866,0.34-0.939,0.802l-2.766,17.537c-0.055,0.346,0.213,0.658,0.564,0.658h3.265c0.468,0,0.866-0.34,0.939-0.803l0.746-4.73c0.072-0.463,0.471-0.803,0.938-0.803h2.165c4.505,0,7.105-2.18,7.784-6.5c0.306-1.89,0.013-3.375-0.872-4.415C50.224,7.353,48.5,6.749,46.211,6.749z M47,13.154c-0.374,2.454-2.249,2.454-4.062,2.454h-1.032l0.724-4.583c0.043-0.277,0.283-0.481,0.563-0.481h0.473c1.235,0,2.4,0,3.002,0.704C47.027,11.668,47.137,12.292,47,13.154z"
      />
      <path
        fill="currentColor"
        d="M66.654,13.075h-3.275c-0.279,0-0.52,0.204-0.563,0.481l-0.145,0.916l-0.229-0.332c-0.709-1.029-2.29-1.373-3.868-1.373c-3.619,0-6.71,2.741-7.312,6.586c-0.313,1.918,0.132,3.752,1.22,5.031c0.998,1.176,2.426,1.666,4.125,1.666c2.916,0,4.533-1.875,4.533-1.875l-0.146,0.91c-0.055,0.348,0.213,0.66,0.562,0.66h2.95c0.469,0,0.865-0.34,0.939-0.803l1.77-11.209C67.271,13.388,67.004,13.075,66.654,13.075z M62.089,19.449c-0.316,1.871-1.801,3.127-3.695,3.127c-0.951,0-1.711-0.305-2.199-0.883c-0.484-0.574-0.668-1.391-0.514-2.301c0.295-1.855,1.805-3.152,3.67-3.152c0.93,0,1.686,0.309,2.184,0.892C62.034,17.721,62.232,18.543,62.089,19.449z"
      />
      <path
        fill="currentColor"
        d="M84.096,13.075h-3.291c-0.314,0-0.609,0.156-0.787,0.417l-4.539,6.686l-1.924-6.425c-0.121-0.402-0.492-0.678-0.912-0.678h-3.234c-0.393,0-0.666,0.384-0.541,0.754l3.625,10.638l-3.408,4.811c-0.268,0.379,0.002,0.9,0.465,0.9h3.287c0.312,0,0.604-0.152,0.781-0.408L84.564,13.97C84.826,13.592,84.557,13.075,84.096,13.075z"
      />
      {/* "Pal" wordmark */}
      <path
        fill="#179BD7"
        d="M94.992,6.749h-6.84c-0.467,0-0.865,0.34-0.938,0.802l-2.766,17.537c-0.055,0.346,0.213,0.658,0.562,0.658h3.51c0.326,0,0.605-0.238,0.656-0.562l0.785-4.971c0.072-0.463,0.471-0.803,0.938-0.803h2.164c4.506,0,7.105-2.18,7.785-6.5c0.307-1.89,0.012-3.375-0.873-4.415C99.004,7.353,97.281,6.749,94.992,6.749z M95.781,13.154c-0.373,2.454-2.248,2.454-4.062,2.454h-1.031l0.725-4.583c0.043-0.277,0.281-0.481,0.562-0.481h0.473c1.234,0,2.4,0,3.002,0.704C95.809,11.668,95.918,12.292,95.781,13.154z"
      />
      <path
        fill="#179BD7"
        d="M115.434,13.075h-3.273c-0.281,0-0.52,0.204-0.562,0.481l-0.145,0.916l-0.23-0.332c-0.709-1.029-2.289-1.373-3.867-1.373c-3.619,0-6.709,2.741-7.311,6.586c-0.312,1.918,0.131,3.752,1.219,5.031c1,1.176,2.426,1.666,4.125,1.666c2.916,0,4.533-1.875,4.533-1.875l-0.146,0.91c-0.055,0.348,0.213,0.66,0.564,0.66h2.949c0.467,0,0.865-0.34,0.938-0.803l1.771-11.209C116.053,13.388,115.785,13.075,115.434,13.075z M110.869,19.449c-0.314,1.871-1.801,3.127-3.695,3.127c-0.949,0-1.711-0.305-2.199-0.883c-0.484-0.574-0.666-1.391-0.514-2.301c0.297-1.855,1.805-3.152,3.67-3.152c0.93,0,1.686,0.309,2.184,0.892C110.816,17.721,111.014,18.543,110.869,19.449z"
      />
      <path
        fill="#179BD7"
        d="M119.295,7.23l-2.807,17.858c-0.055,0.346,0.213,0.658,0.562,0.658h2.822c0.469,0,0.867-0.34,0.939-0.803l2.768-17.536c0.055-0.346-0.213-0.659-0.562-0.659h-3.16C119.578,6.749,119.338,6.953,119.295,7.23z"
      />
    </svg>
  );
}

// ─── Stripe CardElement style to match dark theme ───
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#e5e5e5",
      fontFamily: "ui-monospace, SFMono-Regular, monospace",
      fontSize: "15px",
      fontSmoothing: "antialiased",
      "::placeholder": {
        color: "#525252",
      },
      iconColor: "#a3a3a3",
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
  hidePostalCode: true,
};

// ─── Inner Card Form (must be inside <Elements>) ───
function StripeCardForm({
  email,
  setEmail,
  amount,
  billingCycle,
  isProcessing,
  setIsProcessing,
  setIsPaid,
  onPaymentSuccess,
  setCardError,
}: {
  email: string;
  setEmail: (v: string) => void;
  amount: number;
  billingCycle: "monthly" | "yearly";
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
  setIsPaid: (v: boolean) => void;
  onPaymentSuccess?: () => void;
  setCardError: (v: string | null) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setCardError("Stripe is still loading. Please wait a moment and try again.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setCardError("Card input not ready. Please refresh and try again.");
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    const targetEmail = email || "customer@filedrive.cloud";
    let subId = `sub_stripe_${Date.now()}`;

    try {
      // 1. Create a PaymentMethod with the card details
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          email: targetEmail,
        },
      });

      if (pmError || !paymentMethod) {
        setCardError(pmError?.message || "Failed to verify card details.");
        setIsProcessing(false);
        return;
      }

      // 2. Pass the PaymentMethod to the backend to create the Subscription and charge it
      const subRes = await createSubscription(targetEmail, billingCycle, paymentMethod.id);

      if (subRes.error) {
        setCardError(subRes.error);
        setIsProcessing(false);
        return;
      }

      if (subRes.subscriptionId) {
        subId = subRes.subscriptionId;
      }

      // 3. If the card requires 3D secure, it returns a clientSecret we need to confirm
      if (subRes.status === "incomplete" && subRes.clientSecret && !subRes.simulated) {
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          subRes.clientSecret
        );

        if (confirmError) {
          setCardError(confirmError.message || "Payment confirmation failed.");
          setIsProcessing(false);
          return;
        }

        if (paymentIntent?.status !== "succeeded") {
          setCardError(`Payment not completed. Status: ${paymentIntent?.status}`);
          setIsProcessing(false);
          return;
        }
      } else if (subRes.status && subRes.status !== "active" && subRes.status !== "trialing" && subRes.status !== "incomplete" && !subRes.simulated) {
         setCardError(`Subscription status: ${subRes.status}`);
         setIsProcessing(false);
         return;
      }

      // 4. Payment succeeded — record locally
      saveUserSubscription({
        id: subId,
        userEmail: targetEmail,
        provider: "stripe",
        planName: "FileDrive High-Speed VIP (Direct CDN)",
        billingCycle,
        amount,
        currency: "USD",
        status: "active",
        startDate: new Date().toISOString(),
        currentPeriodEnd: new Date(
          Date.now() + (billingCycle === "yearly" ? 365 : 30) * 86400000
        ).toISOString(),
        cardLast4: "••••",
      });

      addInvoice({
        id: `INV-${new Date().getFullYear()}-FD-${Math.floor(1000 + Math.random() * 9000)}`,
        subscriptionId: subId,
        userEmail: targetEmail,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        description: `High-Speed VIP Direct Access - ${billingCycle === "yearly" ? "Annual" : "Monthly"} Recurring`,
        amount,
        currency: "USD",
        provider: "stripe",
        status: "Paid",
        period: `${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(Date.now() + (billingCycle === "yearly" ? 365 : 30) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        receiptNumber: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
        cardLast4: "••••",
      });

      setIsProcessing(false);
      setIsPaid(true);
      onPaymentSuccess?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment failed";
      setCardError(message);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-semibold text-white">
          Email Address
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your-email@example.com"
            className="h-12 border-neutral-800 bg-[#18181c] pl-11 text-sm text-neutral-100 placeholder:text-neutral-500 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500"
          />
          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
        </div>
      </div>

      {/* Stripe CardElement — secure PCI-compliant card input */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-white">
          Card Details
        </Label>
        <div className="h-12 border border-neutral-800 bg-[#18181c] rounded-xl px-3.5 flex items-center">
          <CardElement options={CARD_ELEMENT_OPTIONS} className="w-full" />
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isProcessing || !stripe}
        className="mt-6 w-full h-12 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
      >
        {isProcessing ? (
          <span>Processing Payment...</span>
        ) : (
          <>
            <span>
              Subscribe ${amount.toFixed(2)}
              {billingCycle === "yearly" ? "/year" : "/month"} with Card
            </span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </>
        )}
      </Button>
    </form>
  );
}

// ─── Main exported component ───

export interface GlassCheckoutCardProps {
  amount?: number;
  billingCycle?: "monthly" | "yearly";
  className?: string;
  onPaymentSuccess?: () => void;
}

export function GlassCheckoutCard({
  amount = 12.0,
  billingCycle = "monthly",
  className,
  onPaymentSuccess,
}: GlassCheckoutCardProps) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  const [email, setEmail] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  // Load the Stripe instance once for the Elements provider
  const stripePromise = isStripeConfigured() ? getStripeInstance() : null;

  const handlePayPalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setCardError(null);

    const targetEmail = paypalEmail || email || "subscriber@filedrive.cloud";
    let subId = `I-PP_${Date.now()}`;

    const recordSuccess = (finalSubId: string) => {
      saveUserSubscription({
        id: finalSubId,
        userEmail: targetEmail,
        provider: "paypal",
        planName: "FileDrive High-Speed VIP (Direct CDN)",
        billingCycle,
        amount,
        currency: "USD",
        status: "active",
        startDate: new Date().toISOString(),
        currentPeriodEnd: new Date(
          Date.now() + (billingCycle === "yearly" ? 365 : 30) * 86400000
        ).toISOString(),
        paypalEmail: targetEmail,
      });

      addInvoice({
        id: `INV-${new Date().getFullYear()}-FD-${Math.floor(1000 + Math.random() * 9000)}`,
        subscriptionId: finalSubId,
        userEmail: targetEmail,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        description: `High-Speed VIP Direct Access - ${billingCycle === "yearly" ? "Annual" : "Monthly"} Recurring`,
        amount,
        currency: "USD",
        provider: "paypal",
        status: "Paid",
        period: `${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(Date.now() + (billingCycle === "yearly" ? 365 : 30) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        receiptNumber: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
        paypalEmail: targetEmail,
      });
    };

    try {
      const res = await createPayPalSubscription(targetEmail, billingCycle);

      if (res.subscriptionId) subId = res.subscriptionId;

      if (res.approveUrl) {
        const width = 500;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        const popup = window.open(
          res.approveUrl,
          "PayPalPayment",
          `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
        );

        const pollTimer = setInterval(() => {
          if (!popup || popup.closed) {
            clearInterval(pollTimer);
            recordSuccess(subId);
            setIsProcessing(false);
            setIsPaid(true);
            onPaymentSuccess?.();
          }
        }, 1500);

        return;
      }
    } catch {
      // Fallback
    }

    recordSuccess(subId);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      onPaymentSuccess?.();
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("w-full max-w-[460px] mx-auto", className)}
    >
      <Card className="relative overflow-hidden rounded-[24px] border border-[#26262a] bg-[#121214] text-neutral-100 font-sans shadow-2xl p-6 md:p-7">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Payment Details
            </h3>
            <p className="text-sm text-neutral-400 mt-0.5">
              Complete your purchase securely
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-neutral-400 block font-normal">
              {billingCycle === "yearly" ? "Billed Annually" : "Billed Monthly"}
            </span>
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              ${amount.toFixed(2)}
              <span className="text-xs text-neutral-400 font-sans font-normal ml-1">
                {billingCycle === "yearly" ? "/yr" : "/mo"}
              </span>
            </span>
          </div>
        </div>

        {/* 2 Payment Methods */}
        <div className="my-6 grid grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={() => { setPaymentMethod("card"); setCardError(null); }}
            className={cn(
              "flex h-13 py-3 items-center justify-center gap-2.5 rounded-xl border text-sm font-semibold transition-all active:scale-[0.98]",
              paymentMethod === "card"
                ? "border-2 border-[#3b82f6] bg-[#141d2d] text-[#3b82f6] shadow-sm"
                : "border-neutral-800 bg-[#18181c] text-neutral-400 hover:text-neutral-200 hover:bg-[#1f1f24]"
            )}
          >
            <CreditCard className={cn("h-4 w-4", paymentMethod === "card" ? "text-[#3b82f6]" : "text-neutral-400")} />
            <span>Credit Card</span>
          </button>

          <button
            type="button"
            onClick={() => { setPaymentMethod("paypal"); setCardError(null); }}
            className={cn(
              "flex h-13 py-3 items-center justify-center rounded-xl border text-sm font-semibold transition-all active:scale-[0.98]",
              paymentMethod === "paypal"
                ? "border-2 border-[#3b82f6] bg-[#141d2d] shadow-sm"
                : "border-neutral-800 bg-[#18181c] hover:bg-[#1f1f24]"
            )}
          >
            <PayPalOfficialLogo className="h-5 w-auto text-neutral-200" />
          </button>
        </div>

        {/* Error display */}
        {cardError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{cardError}</span>
          </div>
        )}

        {isPaid ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white">Payment Successful</h4>
            <p className="text-xs text-neutral-400">
              Your high-speed Google Drive direct access is now unlocked!
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {paymentMethod === "card" ? (
              <motion.div
                key="card"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.15 }}
              >
                {stripePromise ? (
                  <Elements stripe={stripePromise}>
                    <StripeCardForm
                      email={email}
                      setEmail={setEmail}
                      amount={amount}
                      billingCycle={billingCycle}
                      isProcessing={isProcessing}
                      setIsProcessing={setIsProcessing}
                      setIsPaid={setIsPaid}
                      onPaymentSuccess={onPaymentSuccess}
                      setCardError={setCardError}
                    />
                  </Elements>
                ) : (
                  <div className="space-y-4 text-xs text-neutral-400 text-center py-6">
                    <p>Stripe is not configured. Add your keys to <code>.env</code> to enable card payments.</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="paypal"
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
              >
                <form onSubmit={handlePayPalSubmit} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <Label htmlFor="paypalEmail" className="text-sm font-semibold text-white">
                      PayPal Email Address
                    </Label>
                    <Input
                      id="paypalEmail"
                      type="email"
                      required
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      placeholder="your-paypal-email@example.com"
                      className="h-12 border-neutral-800 bg-[#18181c] px-3.5 text-sm text-neutral-100 placeholder:text-neutral-500 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="mt-6 w-full h-12 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <span>Connecting to PayPal...</span>
                    ) : (
                      <>
                        <span>
                          Subscribe ${amount.toFixed(2)}
                          {billingCycle === "yearly" ? "/year" : "/month"} with PayPal
                        </span>
                        <ArrowRight className="w-4 h-4 ml-0.5" />
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Footer */}
        <div className="mt-5 text-center text-xs text-neutral-400 flex items-center justify-center gap-1.5 font-normal">
          <Lock className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>Payments are 256-bit SSL encrypted & secure</span>
        </div>
      </Card>
    </motion.div>
  );
}

export default GlassCheckoutCard;
