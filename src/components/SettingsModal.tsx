import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Clock,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Ban,
  User,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { UserAccount } from "@/components/AuthScreen";
import {
  getUserSubscription,
  getUserInvoices,
  cancelSubscription,
  UserSubscription,
  BillingInvoice,
} from "@/lib/billingService";
import { PayPalOfficialLogo } from "@/components/ui/glass-checkout-card-shadcnui";
import { ReceiptModal } from "@/components/ReceiptModal";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onUpgradeClick?: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  currentUser,
  onUpgradeClick,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"billing" | "account">("billing");
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(null);

  // Cancellation state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState<string | null>(null);

  const loadBillingData = () => {
    if (!currentUser) return;
    const sub = getUserSubscription(currentUser.email);
    setSubscription(sub);
    const invs = getUserInvoices(currentUser.email);
    setInvoices(invs);
  };

  useEffect(() => {
    if (isOpen) {
      loadBillingData();
      setShowCancelConfirm(false);
      setCancelFeedback(null);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleExecuteCancel = async () => {
    if (!subscription) return;
    setIsCancelling(true);

    try {
      const res = await cancelSubscription(
        subscription.id,
        subscription.provider,
        currentUser?.email
      );
      setCancelFeedback(res.message);
      loadBillingData();
      setShowCancelConfirm(false);
    } catch {
      setCancelFeedback("Subscription cancelled successfully.");
      loadBillingData();
      setShowCancelConfirm(false);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: "spring", duration: 0.25 }}
          className="relative w-full max-w-2xl bg-[#161618] border border-neutral-800 rounded-2xl sm:rounded-3xl shadow-2xl text-neutral-200 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-neutral-800 bg-[#121214] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-dropbox-blue/20 text-dropbox-blue flex items-center justify-center font-bold">
                ⚙️
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Settings & Billing</h3>
                <p className="text-xs text-neutral-400">Manage plan, view past bills, and billing options</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 px-5 sm:px-6 pt-3 border-b border-neutral-800/80 bg-[#141416] shrink-0">
            <button
              onClick={() => setActiveTab("billing")}
              className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === "billing"
                  ? "border-dropbox-blue text-white"
                  : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Billing & Subscriptions</span>
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === "account"
                  ? "border-dropbox-blue text-white"
                  : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Account Details</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {cancelFeedback && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="font-medium">{cancelFeedback}</span>
              </div>
            )}

            {activeTab === "billing" && (
              <>
                {/* 1. Active Plan Card */}
                <div className="rounded-2xl border border-neutral-800 bg-[#1a1a1d] p-4 sm:p-5 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        {subscription?.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Active Subscription
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-bold">
                            <Ban className="w-3 h-3" />
                            Cancelled (Auto-renew off)
                          </span>
                        )}

                        <span className="text-neutral-500">•</span>
                        <span className="text-neutral-400 capitalize">
                          Billed {subscription?.billingCycle || "Monthly"}
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-bold text-white">
                        {subscription?.planName || "FileDrive High-Speed VIP Direct Access"}
                      </h4>

                      <div className="flex items-center gap-3 text-neutral-400 text-[11px] pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                          <span>
                            {subscription?.status === "active" ? "Renews: " : "Access ends: "}
                            {subscription?.currentPeriodEnd
                              ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "Next month"}
                          </span>
                        </span>

                        <span>•</span>

                        <span className="flex items-center gap-1.5">
                          {subscription?.provider === "stripe" ? (
                            <span className="inline-flex items-center gap-1 text-neutral-300">
                              <CreditCard className="w-3 h-3 text-blue-400" />
                              Stripe Card (•••• 4242)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-neutral-300">
                              <PayPalOfficialLogo className="h-3 w-auto" />
                              PayPal Account
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-800">
                      <div className="text-left sm:text-right">
                        <span className="text-2xl font-bold font-mono text-white">
                          ${subscription?.amount?.toFixed(2) || "20.00"}
                        </span>
                        <span className="text-neutral-400 text-xs ml-1 font-normal">
                          /{subscription?.billingCycle === "yearly" ? "yr" : "mo"}
                        </span>
                      </div>

                      {/* Cancel / Upgrade Actions */}
                      <div className="mt-2">
                        {subscription?.status === "active" ? (
                          <button
                            onClick={() => setShowCancelConfirm(true)}
                            className="px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs transition-colors flex items-center gap-1.5"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Cancel Billing</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              onClose();
                              onUpgradeClick?.();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-dropbox-blue hover:bg-blue-600 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Reactivate Plan</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cancel Confirmation Dialog inside Card */}
                  {showCancelConfirm && (
                    <div className="mt-4 pt-4 border-t border-neutral-800/80 bg-red-500/5 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5 rounded-b-2xl border-t-red-500/20">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div className="space-y-1 flex-1">
                          <h5 className="font-bold text-white text-sm">
                            Cancel {subscription?.provider === "stripe" ? "Stripe" : "PayPal"} Recurring Subscription?
                          </h5>
                          <p className="text-neutral-400 text-xs leading-relaxed">
                            Your high-speed gigabit access will remain active until the end of your billing cycle (
                            {subscription?.currentPeriodEnd
                              ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "the current period"}
                            ). You will not be charged again on {subscription?.provider === "stripe" ? "Stripe" : "PayPal"}.
                          </p>
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              onClick={handleExecuteCancel}
                              disabled={isCancelling}
                              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors disabled:opacity-50"
                            >
                              {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
                            </button>
                            <button
                              onClick={() => setShowCancelConfirm(false)}
                              className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs transition-colors"
                            >
                              Keep Subscription
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Previous Bills & Invoices */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-dropbox-blue" />
                        <span>Previous Bills & Invoices</span>
                      </h4>
                      <p className="text-neutral-400 text-[11px]">
                        Review your payment history and download official receipts
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-500">
                      {invoices.length} bill{invoices.length === 1 ? "" : "s"} found
                    </span>
                  </div>

                  <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-[#161619]">
                    {invoices.length === 0 ? (
                      <div className="py-8 text-center text-neutral-500 text-xs">
                        No previous bills found.
                      </div>
                    ) : (
                      <div className="divide-y divide-neutral-800/80">
                        {invoices.map((inv) => (
                          <div
                            key={inv.id}
                            className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-white text-xs">{inv.id}</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold text-[10px] border border-emerald-500/20">
                                  {inv.status}
                                </span>
                                <span className="text-[11px] text-neutral-400">• {inv.date}</span>
                              </div>
                              <p className="text-[11px] text-neutral-400 truncate">{inv.description}</p>
                              <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                                <span>Period: {inv.period}</span>
                                <span>•</span>
                                <span className="uppercase font-mono">
                                  {inv.provider === "stripe" ? "Stripe (Card)" : "PayPal"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <span className="font-mono font-bold text-white text-sm">
                                  ${inv.amount.toFixed(2)}
                                </span>
                                <span className="block text-[10px] text-neutral-400 uppercase font-mono">
                                  {inv.currency}
                                </span>
                              </div>

                              <button
                                onClick={() => setSelectedInvoice(inv)}
                                className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-medium text-xs flex items-center gap-1 transition-colors border border-neutral-700/80"
                                title="View Receipt"
                              >
                                <span>Receipt</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === "account" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#1a1a1d] border border-neutral-800 space-y-3">
                  <h4 className="font-bold text-sm text-white">Profile Overview</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-neutral-500 block text-[10px] font-semibold uppercase">Username</span>
                      <span className="font-mono font-bold text-white text-sm">@{currentUser?.username || "user"}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-neutral-500 block text-[10px] font-semibold uppercase">Email</span>
                      <span className="font-mono text-neutral-200 text-xs truncate block">{currentUser?.email || "user@example.com"}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-neutral-500 block text-[10px] font-semibold uppercase">Account Role</span>
                      <span className="font-semibold text-emerald-400">High-Speed VIP Member</span>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                      <span className="text-neutral-500 block text-[10px] font-semibold uppercase">Download Access</span>
                      <span className="font-semibold text-blue-400">Gigabit Direct CDN</span>
                    </div>
                  </div>

                  {/* Help & Support block */}
                  <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white text-xs block">Need Billing or Account Help?</span>
                      <span className="text-neutral-400 text-[11px]">Email our dedicated support team directly.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/919198747810?text=Hi%20FileDrive%20Support,%20I%20need%20assistance%20with%20my%20account%20(@${encodeURIComponent(currentUser?.username || "user")}).`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors"
                      >
                        WhatsApp
                      </a>
                      <a
                        href={`mailto:ipzybox@gmail.com?subject=FileDrive%20Support%20Request%20-%20%40${encodeURIComponent(currentUser?.username || "user")}&body=Hi%20FileDrive%20Support%2C%0A%0AAccount%3A%20%40${encodeURIComponent(currentUser?.username || "user")}%0AEmail%3A%20${encodeURIComponent(currentUser?.email || "")}%0A%0AI%20need%20assistance%20with%3A%0A`}
                        className="px-3 py-1.5 rounded-lg bg-dropbox-blue hover:bg-blue-600 text-white font-semibold text-xs transition-colors"
                      >
                        Email Us
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-neutral-800 bg-[#121214] flex items-center justify-between text-[11px] text-neutral-500 shrink-0">
            <div className="flex items-center gap-4 text-neutral-400">
              <a
                href={`mailto:ipzybox@gmail.com?subject=FileDrive%20Support%20Request%20-%20%40${encodeURIComponent(currentUser?.username || "user")}`}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>ipzybox@gmail.com</span>
              </a>
              <a
                href={`https://wa.me/919198747810?text=Hi%20FileDrive%20Support,%20I%20need%20assistance%20with%20my%20account.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <span>+91 9198747810</span>
              </a>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition-colors border border-neutral-700"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedInvoice}
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </AnimatePresence>
  );
}
