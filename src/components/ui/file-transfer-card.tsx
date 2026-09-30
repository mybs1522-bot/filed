import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Info, Laptop, Lock, Phone, Wifi, Zap, Pause, Play, Square, Maximize2, Minimize2 } from "lucide-react";

// Define the props interface for type-safety and reusability
export interface FileTransferCardProps {
  /** The current status of the transfer */
  status: "in-progress" | "paused" | "completed" | "connecting" | "failed";
  /** The current progress percentage (0-100) */
  progress: number;
  /** Details of the source device */
  sourceDevice: {
    name: string;
    type: "phone" | "laptop";
  };
  /** Details of the destination device */
  destinationDevice: {
    name: string;
    type: "phone" | "laptop";
  };
  /** Estimated time remaining for the transfer */
  estimatedTime: string;
  /** Current transfer speed */
  transferRate: string;
  /** A summary of the file types being transferred */
  fileTypes?: string;
  /** The total size of the files */
  totalFileSize: string;
  /** Callback function for the cancel action */
  onCancel: () => void;
  /** Callback function for the pause/resume action */
  onTogglePause: () => void;
  /** Optional custom title */
  title?: string;
  /** Optional upgrade to fast direct links action */
  onUpgrade?: () => void;
  /** Optional custom className */
  className?: string;
  /** Compact/minimized view (shows only progress bar, CTA, and maximize icon) */
  compact?: boolean;
  /** Callback to toggle maximize/expand details */
  onToggleMaximize?: () => void;
  /** Optional click-to-test helper to jump to 99.2% */
  onTestFastForward?: () => void;
}

// Helper to render the correct device icon (clean white/monochrome)
const DeviceIcon = ({ type, className }: { type: "phone" | "laptop"; className?: string }) => {
  const iconClasses = cn("h-10 w-10 text-white stroke-[1.5]", className);
  if (type === "phone") {
    return <Phone className={iconClasses} />;
  }
  return <Laptop className={iconClasses} />;
};

// The main component - Strictly black & white, with ONLY the progress bar green
export const FileTransferCard = ({
  status,
  progress,
  sourceDevice,
  destinationDevice,
  estimatedTime,
  transferRate,
  totalFileSize,
  onCancel,
  onTogglePause,
  title = "FileDrive Smart Transfer",
  onUpgrade,
  className,
  compact = false,
  onToggleMaximize,
  onTestFastForward,
}: FileTransferCardProps) => {
  return (
    <Card className={cn("w-full max-w-md mx-auto overflow-hidden bg-[#141414] text-white border-neutral-800 shadow-2xl rounded-2xl", className)}>
      {!compact && (
        <>
          <CardHeader className="pb-2 pt-4 px-5 sm:px-6">
            <CardTitle className="text-center text-base sm:text-lg font-bold tracking-tight text-white">
              {title}
            </CardTitle>
          </CardHeader>

          {/* Device Info Section */}
          <div className="px-4 sm:px-6 pt-1">
            <div className="flex items-center justify-between gap-2 text-center text-sm">
              <div className="flex flex-col items-center gap-1.5 min-w-0 flex-1">
                <DeviceIcon type={sourceDevice.type} />
                <span className="text-neutral-400 text-[11px]">Sending from</span>
                <p className="font-semibold text-white text-xs truncate max-w-[130px]">{sourceDevice.name}</p>
              </div>

              {/* WiFi Animation - Monochrome White */}
              <div className="flex items-center gap-1 text-white px-2 shrink-0">
                <Wifi className="h-4 w-4 text-white" />
                <span className="h-1.5 w-1.5 bg-white rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                <span className="h-1.5 w-1.5 bg-white rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                <span className="h-1.5 w-1.5 bg-white rounded-full animate-pulse"></span>
              </div>

              <div className="flex flex-col items-center gap-1.5 min-w-0 flex-1">
                <DeviceIcon type={destinationDevice.type} />
                <span className="text-neutral-400 text-[11px]">Sending to</span>
                <p className="font-semibold text-white text-xs truncate max-w-[130px]">{destinationDevice.name}</p>
              </div>
            </div>
          </div>
        </>
      )}

      <CardContent className={cn("px-4 sm:px-6 pb-5 space-y-3.5", compact ? "pt-4" : "pt-4")}>
        {/* Progress Bar Section with Icons on the Right of the Bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5 text-xs">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">Transfer progress</h3>
              {onToggleMaximize && (
                <button
                  type="button"
                  onClick={onToggleMaximize}
                  title={compact ? "Maximize to show all details" : "Collapse to compact view"}
                  className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors inline-flex items-center gap-1 text-[10px] font-medium border border-neutral-700/60"
                >
                  {compact ? (
                    <>
                      <Maximize2 className="w-3 h-3 text-blue-400" />
                      <span>Details</span>
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-3 h-3 text-neutral-400" />
                      <span>Less</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <span
              onClick={onTestFastForward}
              title={onTestFastForward ? "Click to fast-forward to 99.2% for test" : undefined}
              className={cn(
                "font-mono font-bold transition-colors",
                status === "failed" ? "text-red-400 font-extrabold animate-pulse" : "text-white",
                onTestFastForward && "cursor-pointer hover:text-blue-400"
              )}
            >
              {progress.toFixed(2)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* PROGRESS BAR - Green when normal, Red when failed at 99.3% */}
            <Progress
              value={progress}
              className="h-3.5 flex-1 bg-neutral-900 border border-neutral-700 p-0.5 rounded-full"
              indicatorClassName={
                status === "failed"
                  ? "bg-red-500 shadow-[0_0_14px_rgba(239,68,68,0.85)]"
                  : "bg-[#22c55e] shadow-[0_0_14px_rgba(34,197,94,0.7)]"
              }
            />

            {/* Pause & Stop Icons on the Right of the Bar */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={onTogglePause}
                disabled={status === "completed" || status === "failed"}
                title={status === "paused" ? "Resume" : "Pause"}
                className="w-7 h-7 rounded-lg bg-[#242424] hover:bg-[#303030] text-white flex items-center justify-center border border-neutral-700/80 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {status === "paused" ? (
                  <Play className="w-3.5 h-3.5 fill-white text-white translate-x-0.5" />
                ) : (
                  <Pause className="w-3.5 h-3.5 fill-white text-white" />
                )}
              </button>

              <button
                type="button"
                onClick={onCancel}
                disabled={status === "completed"}
                title="Stop / Cancel Download"
                className="w-7 h-7 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 flex items-center justify-center border border-red-500/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Square className="w-3 h-3 fill-current" />
              </button>
            </div>
          </div>

          <p className="text-center text-[11px] mt-1.5">
            {status === "failed" ? (
              <span className="text-red-400 font-semibold animate-pulse">
                Connection dropped at {progress.toFixed(1)}% • Free server quota exceeded
              </span>
            ) : (
              <span className="text-neutral-400">
                Your file transfer is {progress.toFixed(1)}% completed ({status})
              </span>
            )}
          </p>
        </div>

        {/* Shortened Transfer Details - shown when NOT compact */}
        {!compact && (
          <div className="bg-[#1c1c1c] border border-neutral-800 rounded-xl p-3 text-xs space-y-2">
            <div className="grid grid-cols-2 gap-2 text-neutral-300">
              <div>
                <span className="text-[10px] text-neutral-400 block font-medium">Transfer Rate</span>
                <span className="font-mono font-semibold text-white text-xs">{transferRate}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-400 block font-medium">Time Remaining</span>
                <span className="font-mono font-semibold text-white text-xs">{estimatedTime}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px]">
              <span className="text-neutral-400">Downloaded</span>
              <span className="font-mono font-semibold text-white">{totalFileSize}</span>
            </div>
          </div>
        )}

        {/* Speed up CTA if onUpgrade is provided */}
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="w-full py-2.5 px-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.99] cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span>Speed Up with High Speed Download</span>
          </button>
        )}

        {/* Security Footer - Clean Monochrome - shown when NOT compact */}
        {!compact && (
          <div className="flex items-center justify-center gap-2 text-neutral-400 text-[11px] pt-1">
            <Lock className="h-3 w-3 text-white" />
            <span>Your transfer is encrypted and secure</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
