import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Zap,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Download,
  Sparkles,
  Lock,
  ArrowRight
} from "lucide-react"
import { Course } from "@/data/courses"
import confetti from "canvas-confetti"
import { GlassCheckoutCard } from "@/components/ui/glass-checkout-card-shadcnui"

interface GoogleDriveLinksModalProps {
  course: Course | null
  isOpen: boolean
  billingCycle?: "monthly" | "yearly"
  onClose: () => void
  onPaymentSuccess?: () => void
}

export function GoogleDriveLinksModal({
  course,
  isOpen,
  billingCycle = "monthly",
  onClose,
  onPaymentSuccess,
}: GoogleDriveLinksModalProps) {
  if (!isOpen || !course) return null

  const isYearly = billingCycle === "yearly"
  const planAmount = isYearly ? 120.0 : 12.0
  const planPeriodText = isYearly ? "Unlimited High Speed Downloads For Year" : "Unlimited High Speed Downloads For Month"

  const [copied, setCopied] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Check if user is already subscribed
      const currentEmail = localStorage.getItem("filedrive_account")
        ? JSON.parse(localStorage.getItem("filedrive_account") as string).email
        : undefined
      const sub = window.localStorage.getItem("filedrive_active_subscription")
      if (sub && currentEmail) {
        try {
          const parsed = JSON.parse(sub)
          if (parsed.status === "active" && parsed.userEmail === currentEmail) {
            setIsUnlocked(true)
          } else {
             // Reset state when opened for a non-subscribed user
             setIsUnlocked(false)
          }
        } catch(e) {}
      } else {
          setIsUnlocked(false)
      }
    }
  }, [isOpen])
  const directGdriveLink = course.googleDriveUrl || `https://drive.google.com/uc?export=download&id=1Xz9_${course.id}_direct`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directGdriveLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSimulatePayment = () => {
    setIsUnlocked(true)
    onPaymentSuccess?.()
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    })
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="relative w-full max-w-[460px]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-850 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {!isUnlocked ? (
            /* Clean checkout card matching user screenshot */
            <GlassCheckoutCard
              amount={planAmount}
              billingCycle={billingCycle}
              className="w-full"
              onPaymentSuccess={handleSimulatePayment}
            />
          ) : (
            /* Unlocked State with Direct Link & Fast Download */
            <div className="relative w-full bg-[#121214] border border-[#26262a] rounded-[24px] shadow-2xl overflow-hidden text-neutral-100 p-6 md:p-7 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-dropbox-blue/20 text-blue-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Access Unlocked!</h3>
                  <p className="text-xs text-blue-300">{planPeriodText}</p>
                </div>
              </div>

              {/* Direct link box */}
              <div>
                <label className="text-xs text-neutral-400 block mb-1.5 font-medium">
                  Official Direct High-Speed Download URL:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={directGdriveLink}
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono text-neutral-200 outline-none select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 flex items-center gap-1.5 transition-colors border border-neutral-700"
                    title="Copy Link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={directGdriveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5 transition-colors border border-emerald-500/20"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Direct Link</span>
                  </a>
                </div>
              </div>

              {/* Fast Download Link */}
              <a
                href={directGdriveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-dropbox-blue hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-blue-500/25"
              >
                <Download className="w-4 h-4" />
                <span>Start Fast Gigabit Download Now</span>
              </a>

              <div className="pt-2 flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-850">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <ShieldCheck className="w-4 h-4" /> Verified High-Speed Mirror
                </span>
                <span className="text-[11px] text-neutral-500">Fast 1-Click Access</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
