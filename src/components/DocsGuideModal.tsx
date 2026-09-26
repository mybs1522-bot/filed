import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, BookOpen, Terminal, FolderCheck, CheckCircle2, Copy, Layers, Tag } from "lucide-react"
import { FileTransferCardDemo } from "@/components/ui/file-transfer-demo"
import PricingCard from "@/components/ui/pricing-card"
import { GlassCheckoutCard } from "@/components/ui/glass-checkout-card-shadcnui"
import { CreditCard } from "lucide-react"

interface DocsGuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DocsGuideModal({ isOpen, onClose }: DocsGuideModalProps) {
  if (!isOpen) return null

  const [activeTab, setActiveTab] = useState<"guide" | "component-demo" | "pricing-card" | "checkout-card">("guide")
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null)

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedSnippet(id)
    setTimeout(() => setCopiedSnippet(null), 2000)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-[#1b1b1b] border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-neutral-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#212121]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-white">
                  Developer Setup & shadcn Architecture Guide
                </h3>
                <p className="text-xs text-neutral-400">
                  Tailwind CSS, TypeScript &amp; <code>/components/ui</code> Conventions
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

          {/* Sub Navigation */}
          <div className="flex items-center gap-2 px-6 py-2 bg-[#171717] border-b border-neutral-800 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab("guide")}
              className={`px-3 py-1 rounded-md font-medium transition-colors shrink-0 ${
                activeTab === "guide" ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              Setup Instructions
            </button>
            <button
              onClick={() => setActiveTab("component-demo")}
              className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === "component-demo" ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>FileTransferCard Demo</span>
            </button>
            <button
              onClick={() => setActiveTab("pricing-card")}
              className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === "pricing-card" ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span>PricingCard Demo</span>
            </button>
            <button
              onClick={() => setActiveTab("checkout-card")}
              className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === "checkout-card" ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>Glass Checkout (Card &amp; PayPal)</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-300">
            {activeTab === "guide" ? (
              <>
                {/* Section 1: Why /components/ui */}
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <FolderCheck className="w-4 h-4 text-emerald-400" />
                    <span>Why is the <code>/components/ui</code> folder important?</span>
                  </div>
                  <p className="text-neutral-300 leading-relaxed">
                    In the modern React and <strong>shadcn/ui</strong> ecosystem, <code>/components/ui</code> is the designated standard directory for <strong>reusable, unstyled-to-primitives design system components</strong> (such as <code>button.tsx</code>, <code>card.tsx</code>, <code>progress.tsx</code>, and <code>file-transfer-card.tsx</code>).
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-neutral-400 pl-1">
                    <li><strong>CLI Automation:</strong> <code>npx shadcn@latest add &lt;component&gt;</code> looks up <code>components.json</code> and places components directly into <code>@/components/ui</code>.</li>
                    <li><strong>Separation of Concerns:</strong> Isolates primitive design tokens from domain-specific features (e.g. course lists, download modals).</li>
                    <li><strong>Standardized Imports:</strong> Predictable imports across the entire app via <code>@/components/ui/file-transfer-card</code>.</li>
                  </ul>
                </div>

                {/* Section 2: Scaffolding a fresh shadcn project */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-sky-400" />
                    <span>How to setup a fresh project via shadcn CLI</span>
                  </h4>
                  <div className="relative bg-black/60 rounded-xl p-3 border border-neutral-800 font-mono text-[11px] text-sky-300">
                    <button
                      onClick={() =>
                        copyCode(
                          "npx create-vite@latest my-app --template react-ts\ncd my-app\nnpx shadcn@latest init",
                          "shadcn-init"
                        )
                      }
                      className="absolute top-2 right-2 p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                    >
                      {copiedSnippet === "shadcn-init" ? "Copied!" : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <pre>{`# 1. Create Vite React TypeScript app\nnpx create-vite@latest my-app --template react-ts\ncd my-app\n\n# 2. Initialize shadcn (configures tailwind, tsconfig, /components/ui)\nnpx shadcn@latest init`}</pre>
                  </div>
                </div>

                {/* Section 3: Installing Tailwind CSS & TypeScript manually */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    <span>Manual Tailwind, Radix UI &amp; TypeScript Installation</span>
                  </h4>
                  <div className="relative bg-black/60 rounded-xl p-3 border border-neutral-800 font-mono text-[11px] text-amber-300">
                    <button
                      onClick={() =>
                        copyCode(
                          "npm install -D tailwindcss postcss autoprefixer @types/node\nnpx tailwindcss init -p\nnpm install lucide-react framer-motion clsx tailwind-merge @radix-ui/react-slot class-variance-authority @radix-ui/react-progress",
                          "tailwind-install"
                        )
                      }
                      className="absolute top-2 right-2 p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                    >
                      {copiedSnippet === "tailwind-install" ? "Copied!" : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <pre>{`# 1. Install Tailwind & PostCSS\nnpm install -D tailwindcss postcss autoprefixer @types/node\nnpx tailwindcss init -p\n\n# 2. Install component dependencies\nnpm install lucide-react framer-motion clsx tailwind-merge @radix-ui/react-slot class-variance-authority @radix-ui/react-progress`}</pre>
                  </div>
                </div>

                {/* Section 4: Path Alias Configuration */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-white text-sm">Path Aliases (<code>@/*</code> to <code>./src/*</code>)</h4>
                  <p className="text-neutral-400">
                    Ensure <code>tsconfig.json</code> has <code>&quot;paths&quot;: &#123; &quot;@/*&quot;: [&quot;./src/*&quot;] &#125;</code> and <code>vite.config.ts</code> defines <code>resolve.alias: &#123; &apos;@&apos;: path.resolve(import.meta.dirname, &apos;./src&apos;) &#125;</code>.
                  </p>
                </div>
              </>
            ) : activeTab === "component-demo" ? (
              <div className="space-y-3">
                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-neutral-400 text-xs">
                  Standalone preview of <code>FileTransferCardDemo</code> from <code>@/components/ui/file-transfer-demo.tsx</code>:
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-neutral-800 flex justify-center">
                  <FileTransferCardDemo />
                </div>
              </div>
            ) : activeTab === "pricing-card" ? (
              <div className="space-y-3">
                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-neutral-400 text-xs">
                  Standalone preview of <code>PricingCard</code> from <code>@/components/ui/pricing-card.tsx</code>:
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-neutral-800 flex justify-center">
                  <PricingCard />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-neutral-400 text-xs">
                  Preview of <code>GlassCheckoutCard</code> from <code>@/components/ui/glass-checkout-card-shadcnui.tsx</code> with 2 payment methods (Card &amp; PayPal):
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-neutral-800 flex justify-center">
                  <GlassCheckoutCard amount={20.0} />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
