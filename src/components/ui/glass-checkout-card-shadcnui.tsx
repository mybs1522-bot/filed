import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, ArrowRight, AlertCircle } from "lucide-react";

export interface GlassCheckoutCardProps {
  amount?: number;
  billingCycle?: "monthly" | "yearly";
  className?: string;
  onPaymentSuccess?: () => void;
  userEmail?: string;
}

export function GlassCheckoutCard({
  amount = 12.0,
  billingCycle = "monthly",
  className,
  userEmail,
}: GlassCheckoutCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleStripeCheckout = async () => {
    setIsProcessing(true);
    setCardError(null);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail || undefined,
          interval: billingCycle,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Server error" }));
        setCardError(errData.error || "Failed to create checkout session.");
        setIsProcessing(false);
        return;
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        setCardError("Could not retrieve checkout URL.");
        setIsProcessing(false);
      }
    } catch {
      setCardError("Network error connecting to Stripe. Please try again.");
      setIsProcessing(false);
    }
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

        {/* Error display */}
        {cardError && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{cardError}</span>
          </div>
        )}

        {/* Stripe Checkout Card Content */}
        <div className="mt-6 space-y-5">
          {/* What you get */}
          <div className="rounded-xl border border-neutral-800 bg-[#18181c] p-4 space-y-2.5">
            <p className="text-[11px] uppercase tracking-widest text-neutral-500 font-semibold">What you get</p>
            {[
              "Unlimited high-speed downloads",
              "Direct Google Drive CDN access",
              "Multi-thread chunked transfers",
              "Cancel anytime — no lock-in",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-xs text-neutral-300">{item}</span>
              </div>
            ))}
          </div>

          {/* Direct Stripe Checkout Button */}
          <Button
            type="button"
            disabled={isProcessing}
            onClick={handleStripeCheckout}
            className="w-full h-13 rounded-xl bg-[#635bff] hover:bg-[#5147e5] text-white font-semibold text-sm shadow-lg shadow-[#635bff]/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {isProcessing ? (
              <span>Redirecting to Stripe...</span>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                </svg>
                <span>Subscribe Premium</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-500 pt-1">
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>256-bit SSL</span>
            </div>
            <span>•</span>
            <span>Powered by Stripe</span>
            <span>•</span>
            <span>Cancel anytime</span>
          </div>
        </div>

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
