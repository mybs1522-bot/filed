import React, { useState } from "react"
import { Search, UserPlus, Sparkles, LogIn, LogOut, ChevronDown, Menu, Settings, HelpCircle, MessageCircle } from "lucide-react"
import { UserAccount } from "@/components/AuthScreen"
import { FileDriveLogo } from "@/components/ui/FileDriveLogo"

interface DropboxHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onUpgradeClick: () => void
  onNewFolderClick?: () => void
  currentUser: UserAccount | null
  onOpenAuth: () => void
  onLogout: () => void
  onOpenSettings?: () => void
  onOpenMobileSidebar?: () => void
}

export function DropboxHeader({
  searchQuery,
  onSearchChange,
  onUpgradeClick,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenSettings,
  onOpenMobileSidebar,
}: DropboxHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="h-14 bg-[#121212] border-b border-[#262626] px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 select-none shrink-0">
      {/* Left: Mobile Hamburger and Desktop + New / Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-xl">
        {/* Mobile Hamburger Button */}
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors md:hidden shrink-0"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Mobile Brand Name beside Hamburger */}
        <div className="flex items-center md:hidden">
          <FileDriveLogo size="sm" />
        </div>

        {/* Desktop Only: Search Bar (Hidden on Phone, located inside Hamburger) */}
        <div className="relative flex-1 min-w-[100px] hidden md:block">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search courses, lessons, software..."
            className="w-full bg-[#1e1e1e] hover:bg-[#242424] focus:bg-[#242424] text-neutral-200 placeholder:text-neutral-500 rounded-lg pl-9 pr-4 py-1.5 text-xs outline-none border border-transparent focus:border-neutral-600 transition-colors"
          />
        </div>
      </div>

      {/* Right: Upgrade button and User Email Username */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2a2a2a] text-neutral-300 hover:text-white text-xs font-medium border border-neutral-700/60 transition-colors">
          <UserPlus className="w-3.5 h-3.5 text-neutral-400" />
          <span>Invite members</span>
        </button>

        {/* Neon 'Click to upgrade' button */}
        <button
          onClick={onUpgradeClick}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#b4ff39] hover:bg-[#a2e633] text-neutral-950 text-[11px] sm:text-xs font-bold shadow-md shadow-[#b4ff39]/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5 text-black shrink-0" />
          <span className="hidden sm:inline">Click to upgrade</span>
          <span className="sm:hidden">Upgrade</span>
        </button>

        {/* SHOW EMAIL USERNAME IN PLACE OF SIGN IN */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1.5 rounded-xl bg-[#222222] hover:bg-[#2a2a2a] border border-neutral-700/80 cursor-pointer transition-colors shadow-sm"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-dropbox-blue/40 ring-1 ring-dropbox-blue/50 flex items-center justify-center shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="font-semibold text-xs text-white max-w-[80px] sm:max-w-[140px] truncate">
                {currentUser.username}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            </button>

            {/* Profile Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-[#202020] border border-neutral-700 rounded-xl shadow-2xl py-2 z-40 text-xs text-neutral-200">
                <div className="px-3.5 py-2 border-b border-neutral-800">
                  <div className="text-[11px] text-neutral-400">Signed in as:</div>
                  <div className="font-bold text-white truncate text-sm">@{currentUser.username}</div>
                  <div className="text-[11px] text-neutral-400 truncate mt-0.5">{currentUser.email}</div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      onOpenSettings?.()
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-white/10 transition-colors flex items-center gap-2 text-neutral-200 hover:text-white font-medium cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Settings & Billing</span>
                  </button>

                  <a
                    href={`mailto:ipzybox@gmail.com?subject=FileDrive%20Support%20Request%20-%20%40${encodeURIComponent(currentUser.username)}&body=Hi%20FileDrive%20Support%2C%0A%0AAccount%3A%20%40${encodeURIComponent(currentUser.username)}%0AEmail%3A%20${encodeURIComponent(currentUser.email)}%0A%0AI%20need%20assistance%20with%3A%0A`}
                    onClick={() => setShowUserMenu(false)}
                    className="w-full text-left px-3.5 py-2 hover:bg-white/10 transition-colors flex items-center gap-2 text-neutral-200 hover:text-white font-medium cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Email Support</span>
                  </a>

                  <a
                    href={`https://wa.me/919198747810?text=Hi%20FileDrive%20Support,%20I%20need%20assistance%20with%20my%20account%20(@${encodeURIComponent(currentUser.username)}).`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full text-left px-3.5 py-2 hover:bg-white/10 transition-colors flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500/70" />
                    <span>WhatsApp Support</span>
                  </a>

                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      onLogout()
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-white/10 transition-colors flex items-center gap-2 text-red-400 hover:text-red-300 font-medium cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dropbox-blue hover:bg-blue-600 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  )
}
