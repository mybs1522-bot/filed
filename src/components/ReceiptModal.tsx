import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Printer, Download, CheckCircle2, ShieldCheck, FileText } from "lucide-react";
import { BillingInvoice } from "@/lib/billingService";
import { FileDriveLogo } from "./ui/FileDriveLogo";

interface ReceiptModalProps {
  invoice: BillingInvoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptModal({ invoice, isOpen, onClose }: ReceiptModalProps) {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-[#18181b] border border-neutral-800 rounded-2xl shadow-2xl text-neutral-200 overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#141416]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-sm text-white">Payment Receipt</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Receipt Printable Content */}
          <div className="p-6 space-y-6 text-xs" id="printable-receipt">
            {/* Top Brand & Status */}
            <div className="flex items-start justify-between">
              <div>
                <FileDriveLogo size="sm" />
                <p className="text-[11px] text-neutral-400 mt-1">High-Speed CDN Direct Infrastructure</p>
                <p className="text-[11px] text-neutral-500 font-mono">receipts@filedrive.cloud</p>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                  <CheckCircle2 className="w-3 h-3" /> PAID
                </span>
                <p className="font-mono text-neutral-400 text-[11px] mt-1.5">{invoice.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#121214] border border-neutral-800/80">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">Billed To</span>
                <span className="font-medium text-white block mt-0.5">{invoice.userEmail}</span>
                <span className="text-[11px] text-neutral-400 block font-mono">User ID: @{invoice.userEmail.split("@")[0]}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">Payment Details</span>
                <span className="font-medium text-white block mt-0.5 capitalize">
                  Stripe (Card ending 4242)
                </span>
                <span className="text-[11px] text-neutral-400 block font-mono">{invoice.date}</span>
              </div>
            </div>

            {/* Item Table */}
            <div className="border border-neutral-800 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 px-4 py-2 bg-neutral-900/60 font-semibold text-neutral-400 text-[11px] border-b border-neutral-800">
                <span className="col-span-8">Description</span>
                <span className="col-span-2 text-center">Period</span>
                <span className="col-span-2 text-right">Amount</span>
              </div>
              <div className="grid grid-cols-12 px-4 py-3 items-center text-neutral-200">
                <div className="col-span-8">
                  <div className="font-medium text-white">{invoice.description}</div>
                  <div className="text-[11px] text-neutral-400">Unlimited Gigabit Direct Google Drive Mirror Access</div>
                </div>
                <div className="col-span-2 text-center text-neutral-400 text-[11px] font-mono">
                  {invoice.period.includes("–") ? invoice.period.split("–")[0].trim() : "1 Mo"}
                </div>
                <div className="col-span-2 text-right font-mono font-bold text-white">
                  ${invoice.amount.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-800 text-right">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span className="font-mono text-white">${invoice.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Tax (0%)</span>
                <span className="font-mono text-neutral-400">$0.00</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
                <span>Total Paid</span>
                <span className="font-mono text-emerald-400">${invoice.amount.toFixed(2)} {invoice.currency}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 pt-2 border-t border-neutral-800">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Verified encrypted transaction processed securely via Stripe.</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-neutral-800 bg-[#141416]">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors border border-neutral-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-dropbox-blue hover:bg-blue-600 text-white font-semibold text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
