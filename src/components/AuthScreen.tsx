import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, ArrowRight, X } from "lucide-react"
import { FileDriveLogo } from "@/components/ui/FileDriveLogo"

export interface UserAccount {
  email: string
  username: string // Email username (e.g. john from john@gmail.com)
  avatar: string
}

interface AuthScreenProps {
  isOpen?: boolean
  onClose?: () => void
  onLogin: (account: UserAccount) => void
}

export function AuthScreen({ isOpen = true, onClose, onLogin }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !email.includes("@")) {
      alert("Please enter a valid email address.")
      return
    }

    if (password.length < 4) {
      alert("Password must be at least 4 characters.")
      return
    }

    // Extract email username (part before @)
    const emailPrefix = email.trim().split("@")[0]
    const username = emailPrefix.toLowerCase()

    const account: UserAccount = {
      email: email.trim(),
      username: username,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}&backgroundColor=0061fe,38bdf8`,
    }

    onLogin(account)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-sm bg-[#1a1a1a] border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-7 text-neutral-100 z-10"
        >
          {/* Optional Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-5">
            <FileDriveLogo size="lg" className="mb-1" />
            <p className="text-xs text-neutral-400 mt-1.5">
              {isSignUp ? "Sign up to start download" : "Log in to start download"}
            </p>
          </div>

          {/* Tab Switcher: Sign Up vs Log In */}
          <div className="flex p-1 bg-neutral-900 border border-neutral-800 rounded-xl mb-5 text-xs">
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-1.5 font-semibold rounded-lg transition-all ${
                isSignUp
                  ? "bg-dropbox-blue text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-1.5 font-semibold rounded-lg transition-all ${
                !isSignUp
                  ? "bg-dropbox-blue text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Log In
            </button>
          </div>

          {/* Form: Email & Password */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-dropbox-blue focus:ring-1 focus:ring-dropbox-blue transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-neutral-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-dropbox-blue focus:ring-1 focus:ring-dropbox-blue transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 mt-2 rounded-xl bg-dropbox-blue hover:bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 active:scale-[0.99]"
            >
              <span>{isSignUp ? "Sign Up" : "Log In"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default AuthScreen
