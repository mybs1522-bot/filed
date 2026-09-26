"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, indicatorClassName, ...props }, ref) => {
  const numericValue = typeof value === "number" ? value : Number(value) || 0
  const safeValue = Math.min(100, Math.max(0, numericValue))

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-neutral-800 border border-neutral-700/80 p-0.5",
        className,
      )}
      value={safeValue}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full bg-[#22c55e] transition-all duration-300 ease-out shadow-[0_0_12px_rgba(34,197,94,0.6)]",
          indicatorClassName
        )}
        style={{
          width: `${Math.max(1.5, safeValue)}%`,
        }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
