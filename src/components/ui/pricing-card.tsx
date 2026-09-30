import React, { useState } from "react";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Zap, Turtle, Rabbit } from "lucide-react";

export interface PlanItem {
  id: "free" | "gdrive";
  name: string;
  badge?: string;
  description: string;
  monthlyPrice: number;
  yearlyMonthlyPrice?: number;
  yearlyPrice: number;
  features: { text: string; highlight?: boolean }[];
  isHighlighted?: boolean;
}

// Exactly 2 plans: Free vs $20 High Speed Download
const plans: PlanItem[] = [
  {
    id: "free",
    name: "Slow - Free",
    badge: "SLOW",
    description: "Standard shared queue • Throttled speed",
    monthlyPrice: 0.0,
    yearlyMonthlyPrice: 0.0,
    yearlyPrice: 0.0,
    features: [
      { text: "Est. Time for 4.18 GB: ~9 to 11 Hours" },
      { text: "No download resume if interrupted" },
      { text: "Single connection thread only" },
      { text: "Shared server bandwidth priority" },
    ],
  },
  {
    id: "gdrive",
    name: "High Speed Download",
    badge: "FASTEST",
    description: "Unlimited High Speed Downloads For Month",
    monthlyPrice: 12.0,
    yearlyMonthlyPrice: 10.0,
    yearlyPrice: 120.0, // Total for 12 months with discount ($10/mo * 12)
    isHighlighted: true,
    features: [
      { text: "Unlimited High Speed Downloads For Month", highlight: true },
      { text: "Direct instant start (Zero wait time)", highlight: true },
      { text: "Est. Time for 4.18 GB: ~45 Seconds" },
      { text: "Full resume capability + multi-thread chunking" },
      { text: "Official high-speed CDN mirrors" },
    ],
  },
];

const TRANSITION = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

export interface PricingCardProps {
  onSelectPlan?: (planId: "free" | "gdrive", cycle?: "monthly" | "yearly") => void;
  defaultPlan?: "free" | "gdrive";
  className?: string;
  showProceedButton?: boolean;
  showHeader?: boolean;
}

export function PricingCard({
  onSelectPlan,
  defaultPlan = "gdrive",
  className = "",
  showProceedButton = true,
  showHeader = false,
}: PricingCardProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<"free" | "gdrive">(defaultPlan);

  const handleProceed = () => {
    onSelectPlan?.(selectedPlan, billingCycle);
  };

  return (
    <div
      className={`w-full max-w-[460px] flex flex-col gap-4 text-neutral-100 font-sans select-none ${className}`}
    >
      {/* Optional Standalone Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Select a Plan
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Choose your preferred download pipeline
            </p>
          </div>
        </div>
      )}

      {/* Sleek Segmented Switcher */}
      <div className="bg-[#19191d] p-1 h-10 w-full rounded-xl border border-neutral-800 flex items-center">
        <button
          type="button"
          onClick={() => setBillingCycle("monthly")}
          className={`flex-1 h-full rounded-lg text-xs font-semibold relative transition-colors duration-150 flex items-center justify-center ${
            billingCycle === "monthly"
              ? "text-white"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          {billingCycle === "monthly" && (
            <motion.div
              layoutId="tab-bg-indicator"
              className="absolute inset-0 bg-[#0d0d0f] rounded-lg shadow-sm border border-neutral-700/60"
              transition={TRANSITION}
            />
          )}
          <span className="relative z-10">Monthly Pass</span>
        </button>

        <button
          type="button"
          onClick={() => setBillingCycle("yearly")}
          className={`flex-1 h-full rounded-lg text-xs font-semibold relative transition-colors duration-150 flex items-center justify-center gap-1.5 ${
            billingCycle === "yearly"
              ? "text-white"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          {billingCycle === "yearly" && (
            <motion.div
              layoutId="tab-bg-indicator"
              className="absolute inset-0 bg-[#0d0d0f] rounded-lg shadow-sm border border-neutral-700/60"
              transition={TRANSITION}
            />
          )}
          <span className="relative z-10">Yearly</span>
          <span className="relative z-10 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-tight">
            2 MONTHS FREE
          </span>
        </button>
      </div>

      {/* Exactly 2 Plans: Free vs $20 */}
      <div className="flex flex-col gap-3">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const price = billingCycle === "monthly" ? plan.monthlyPrice : (plan.yearlyMonthlyPrice ?? plan.yearlyPrice);

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className="relative cursor-pointer transition-all active:scale-[0.995]"
            >
              <div
                className={`relative rounded-2xl transition-all duration-200 overflow-hidden ${
                  isSelected
                    ? plan.id === "gdrive"
                      ? "border-2 border-dropbox-blue bg-gradient-to-b from-blue-950/25 via-[#151720] to-[#121318] shadow-lg shadow-dropbox-blue/15"
                      : "border-2 border-neutral-500 bg-[#161619]"
                    : "border border-neutral-800/80 bg-[#151518] hover:border-neutral-700 hover:bg-[#18181d]"
                }`}
              >
                <div className="p-4 md:p-5">
                  <div className="flex justify-between items-start gap-3">
                    {/* Left: Radio + Title + Subtitle */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="shrink-0 mt-0.5">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? plan.id === "gdrive"
                                ? "border-dropbox-blue bg-transparent"
                                : "border-white bg-transparent"
                              : "border-neutral-700 bg-transparent"
                          }`}
                        >
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className={`w-2.5 h-2.5 rounded-full ${
                                plan.id === "gdrive" ? "bg-dropbox-blue" : "bg-white"
                              }`}
                              transition={{
                                type: "spring",
                                stiffness: 450,
                                damping: 25,
                              }}
                            />
                          )}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Turtle in slow, Rabbit in high speed */}
                          {plan.id === "free" ? (
                            <Turtle className="w-4 h-4 text-amber-400/90 shrink-0" />
                          ) : (
                            <div className="inline-flex items-center gap-0.5 shrink-0">
                              <span className="text-[10px] font-extrabold text-blue-400/70 tracking-tighter select-none font-mono">
                                »
                              </span>
                              <Rabbit className="w-4 h-4 text-dropbox-blue shrink-0 -rotate-12" />
                            </div>
                          )}

                          <h3 className="text-sm md:text-base font-bold text-white tracking-tight leading-snug">
                            {plan.name}
                          </h3>

                          {plan.id === "gdrive" ? (
                            <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-dropbox-blue/20 text-blue-300 border border-dropbox-blue/30 inline-flex items-center gap-1 shadow-sm">
                              <Rabbit className="w-2.5 h-2.5 text-blue-300 -rotate-12" />
                              <span>FASTEST</span>
                            </span>
                          ) : (
                            <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700/60 inline-flex items-center gap-1">
                              <Turtle className="w-2.5 h-2.5 text-amber-400/80" />
                              <span>SLOW</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                          {plan.id === "gdrive"
                            ? billingCycle === "yearly"
                              ? "Unlimited High Speed Downloads For Year"
                              : "Unlimited High Speed Downloads For Month"
                            : plan.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Price */}
                    <div className="text-right shrink-0">
                      <div className="text-base md:text-lg font-bold text-white flex items-center justify-end font-mono tracking-tight">
                        {price === 0 ? (
                          <span className="text-neutral-200 font-sans font-bold text-base">Free</span>
                        ) : (
                          <>
                            <span className="text-xs text-neutral-400 font-sans mr-0.5">$</span>
                            <NumberFlow
                              value={price}
                              format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                            />
                          </>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-medium">
                        {price === 0 ? "Standard" : "/ month"}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Features when Selected */}
                  <AnimatePresence initial={false}>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.25,
                          ease: [0.32, 0.72, 0, 1],
                        }}
                        className="overflow-hidden w-full"
                      >
                        <div className="pt-3.5 mt-3.5 border-t border-neutral-800/80 flex flex-col gap-2">
                          {plan.features.map((feature, idx) => {
                            const featureText =
                              feature.text.includes("For Month") && billingCycle === "yearly"
                                ? feature.text.replace("For Month", "For Year")
                                : feature.text;

                            return (
                              <motion.div
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  delay: idx * 0.03,
                                  duration: 0.2,
                                }}
                                key={idx}
                                className="flex items-center gap-2 text-xs"
                              >
                                <div
                                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                                    plan.id === "gdrive"
                                      ? "bg-blue-500/15 text-blue-400"
                                      : "bg-neutral-800 text-neutral-400"
                                  }`}
                                >
                                  <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                                </div>
                                <span
                                  className={
                                    feature.highlight
                                      ? "text-white font-medium"
                                      : "text-neutral-300"
                                  }
                                >
                                  {featureText}
                                </span>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Action Button */}
      {showProceedButton && (
        <button
          type="button"
          onClick={handleProceed}
          className={`w-full h-12 px-5 rounded-xl font-bold text-xs md:text-sm transition-all shadow-md flex items-center justify-center gap-2 group active:scale-[0.99] ${
            selectedPlan === "gdrive"
              ? "bg-dropbox-blue hover:bg-blue-600 text-white shadow-dropbox-blue/25 hover:shadow-dropbox-blue/40"
              : "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
          }`}
        >
          <span>
            {selectedPlan === "gdrive"
              ? `Get High Speed Download (${billingCycle === "yearly" ? "$120 / year" : "$12"})`
              : "Continue with Slow Download"}
          </span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      )}
    </div>
  );
}

export default PricingCard;
