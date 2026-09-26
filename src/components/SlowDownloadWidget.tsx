import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileTransferCard } from "@/components/ui/file-transfer-card"
import { X, Maximize2, Minimize2 } from "lucide-react"

export interface DownloadSession {
  id: string
  courseId?: string
  fileName: string
  totalBytes: number // e.g. ~4.18 GB
  downloadedBytes: number
  speedKbps: number // 80 - 120 kbps
  isPaused: boolean
  startedAt: number
  username?: string
}

interface SlowDownloadWidgetProps {
  session: DownloadSession | null
  onCancel: () => void
  onUpgradeToFast: () => void
  username?: string
}

export function SlowDownloadWidget({
  session,
  onCancel,
  onUpgradeToFast,
  username = "Your",
}: SlowDownloadWidgetProps) {
  if (!session) return null

  const [downloadedBytes, setDownloadedBytes] = useState(session.downloadedBytes)
  const [currentSpeedKbps, setCurrentSpeedKbps] = useState(session.speedKbps)
  const [isPaused, setIsPaused] = useState(session.isPaused)
  const [isFailed, setIsFailed] = useState(false)
  const [isPhoneDevice, setIsPhoneDevice] = useState(() => {
    if (typeof window === "undefined") return false
    return (
      /Android|iPhone|iPod|Mobile/i.test(navigator.userAgent) ||
      window.innerWidth < 768
    )
  })

  // On phone devices, default to compact/minimized view (isExpanded = false)
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window === "undefined") return true
    const isPhone =
      /Android|iPhone|iPod|Mobile/i.test(navigator.userAgent) ||
      window.innerWidth < 768
    return !isPhone
  })

  useEffect(() => {
    const handleResize = () => {
      const isPhone =
        /Android|iPhone|iPod|Mobile/i.test(navigator.userAgent) ||
        window.innerWidth < 768
      setIsPhoneDevice(isPhone)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // 99.3% failure target
  const TARGET_FAIL_PERCENT = 99.3
  const maxAllowedBytes = session.totalBytes * (TARGET_FAIL_PERCENT / 100)

  // Speed fluctuation interval (updates every 750ms between 80 and 120 kbps)
  useEffect(() => {
    if (isPaused || isFailed) return

    const speedInterval = setInterval(() => {
      const randomSpeed = Math.floor(80 + Math.random() * 41) + Math.random() * 0.9
      setCurrentSpeedKbps(parseFloat(randomSpeed.toFixed(1)))
    }, 750)

    return () => clearInterval(speedInterval)
  }, [isPaused, isFailed])

  // Bytes accumulator interval (stops at 99.3%)
  useEffect(() => {
    if (isPaused || isFailed) return

    const progressInterval = setInterval(() => {
      setDownloadedBytes((prev) => {
        const addedBytes = currentSpeedKbps * 1024 * 0.2
        const next = prev + addedBytes
        if (next >= maxAllowedBytes) {
          setIsFailed(true)
          setCurrentSpeedKbps(0)
          return maxAllowedBytes
        }
        return next
      })
    }, 200)

    return () => clearInterval(progressInterval)
  }, [currentSpeedKbps, isPaused, isFailed, maxAllowedBytes])

  // When failed at 99.3%, show failure and automatically cancel after 2.8s
  useEffect(() => {
    if (!isFailed) return
    const timer = setTimeout(() => {
      onCancel()
    }, 2800)
    return () => clearTimeout(timer)
  }, [isFailed, onCancel])

  // Quick test helper: jumps to 99.2% so user can test failure immediately
  const handleFastForwardToNearEnd = () => {
    const nearEndBytes = session.totalBytes * 0.992
    setDownloadedBytes(nearEndBytes)
  }

  // Formatting helpers
  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const percent = Math.min(
    100,
    parseFloat(((downloadedBytes / session.totalBytes) * 100).toFixed(2))
  )

  const remainingBytes = Math.max(0, session.totalBytes - downloadedBytes)
  const speedBytesPerSec = currentSpeedKbps * 1024
  const remainingSeconds = speedBytesPerSec > 0 ? Math.round(remainingBytes / speedBytesPerSec) : 0

  const formatRemainingTime = (seconds: number) => {
    if (percent >= 100) return "Completed"
    if (seconds <= 0) return "Calculating..."
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs}h ${mins}m remaining`
    }
    return `${mins}m ${secs}s remaining`
  }

  const currentStatus: "in-progress" | "paused" | "completed" | "connecting" | "failed" =
    isFailed
      ? "failed"
      : percent >= 100
      ? "completed"
      : isPaused
      ? "paused"
      : "in-progress"

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 90, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 90, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-2 sm:bottom-4 right-2 sm:right-4 left-2 sm:left-auto w-auto sm:w-[420px] max-w-[calc(100vw-1rem)] z-50 select-none drop-shadow-2xl"
      >
        {/* Floating Top Control Pill - Monochrome with status pulse dot */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1a1a] border border-neutral-700/90 rounded-t-2xl text-xs text-white">
          <div className="flex items-center gap-2 truncate">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isFailed ? "bg-red-500 animate-ping" : "bg-[#22c55e] animate-pulse"
              }`}
            />
            <span className="font-bold text-white truncate max-w-[170px] sm:max-w-[210px]">
              {session.fileName}
            </span>
            <span
              className={`text-[10px] font-mono ${
                isFailed ? "text-red-400 font-semibold" : "text-neutral-400"
              }`}
            >
              {isFailed ? "(Failed at 99.3%)" : `(${currentSpeedKbps.toFixed(1)} KB/s)`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title={isExpanded ? "Collapse to compact view" : "Maximize to show all details"}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4 text-blue-400 hover:text-blue-300" />
              ) : (
                <Maximize2 className="w-4 h-4 text-blue-400 hover:text-blue-300" />
              )}
            </button>
            <button
              onClick={onCancel}
              className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Cancel Transfer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The requested FileTransferCard Component - Black & White with Green Bar */}
        <div className="rounded-b-2xl overflow-hidden border-x border-b border-neutral-700/90">
          <FileTransferCard
            title="FileDrive Smart Transfer"
            status={currentStatus}
            progress={percent}
            compact={!isExpanded}
            onToggleMaximize={() => setIsExpanded(!isExpanded)}
            onTestFastForward={handleFastForwardToNearEnd}
            sourceDevice={{
              name: "FileDrive Cloud Server",
              type: "laptop",
            }}
            destinationDevice={{
              name: `${username}'s ${isPhoneDevice ? "Phone" : "Device"}`,
              type: isPhoneDevice ? "phone" : "laptop",
            }}
            estimatedTime={
              isFailed
                ? "Failed"
                : isPaused
                ? "Paused"
                : formatRemainingTime(remainingSeconds)
            }
            transferRate={
              isFailed
                ? "0.0 KB/s (Dropped)"
                : isPaused
                ? "Paused"
                : `${currentSpeedKbps.toFixed(1)} KB/s`
            }
            fileTypes="Course Bundle (.ZIP, 4K Video)"
            totalFileSize={`${formatBytes(downloadedBytes)} / ${formatBytes(session.totalBytes)}`}
            onCancel={onCancel}
            onTogglePause={() => setIsPaused(!isPaused)}
            onUpgrade={onUpgradeToFast}
            className="rounded-t-none border-t-0 shadow-none bg-[#141414]"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
