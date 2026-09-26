import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Download, Zap, Clock, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from "lucide-react"
import { Course } from "@/data/courses"
import PricingCard from "@/components/ui/pricing-card"

interface DownloadModalProps {
  course: Course | null
  fileTarget?: { name: string; size?: string } | null
  isOpen: boolean
  onClose: () => void
  onSelectSlow: (course: Course, targetName?: string, targetSize?: string) => void
  onSelectGoogleDrive: (course: Course, cycle?: "monthly" | "yearly") => void
}

export function DownloadModal({
  course,
  fileTarget,
  isOpen,
  onClose,
  onSelectSlow,
  onSelectGoogleDrive,
}: DownloadModalProps) {
  if (!isOpen || !course) return null

  const targetTitle = fileTarget ? fileTarget.name : course.name
  const targetSize = fileTarget?.size || course.size

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="relative w-full max-w-lg bg-[#141414] border border-neutral-750 rounded-3xl shadow-2xl overflow-hidden text-neutral-100 my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#242424]/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-dropbox-blue/20 text-dropbox-blue flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Choose Download Speed</h3>
                <p className="text-xs text-neutral-400">
                  {targetTitle} • <span className="text-neutral-300 font-mono font-medium">{targetSize}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content: Free vs $20 Plan */}
          <div className="p-5 flex justify-center bg-[#111111]">
            <PricingCard
              defaultPlan="gdrive"
              onSelectPlan={(planId, cycle) => {
                if (planId === "free") {
                  onSelectSlow(course, fileTarget?.name, fileTarget?.size)
                  onClose()
                } else {
                  onSelectGoogleDrive(course, cycle)
                  onClose()
                }
              }}
              className="border-0 bg-transparent p-0 shadow-none max-w-full"
            />
          </div>

          {/* Footer note */}
          <div className="px-6 py-3 bg-[#171717] border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Guaranteed clean files • Instant activation</span>
            </span>
            <span className="text-neutral-500">Secure 256-bit SSL encrypted</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
