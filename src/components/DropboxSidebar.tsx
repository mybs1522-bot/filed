import React from "react"
import {
  Folder,
  Home,
  Clock,
  FileText,
  Image,
  Users,
  Inbox,
  Trash2,
  Compass,
  X,
  Search
} from "lucide-react"
import { Course } from "@/data/courses"
import { FileDriveLogo } from "@/components/ui/FileDriveLogo"

interface DropboxSidebarProps {
  courses?: Course[]
  activeSection: string
  onSelectSection: (section: string) => void
  onSelectCourse?: (course: Course) => void
  onUpgradeClick?: () => void
  isOpenMobile?: boolean
  onCloseMobile?: () => void
  searchQuery?: string
  onSearchChange?: (q: string) => void
  onNewFolderClick?: () => void
  isSubscribed?: boolean
}

export function DropboxSidebar({
  activeSection,
  onSelectSection,
  isOpenMobile = false,
  onCloseMobile,
  searchQuery = "",
  onSearchChange,
  onNewFolderClick,
}: DropboxSidebarProps) {

  const sidebarContent = (
    <div className="w-72 md:w-64 h-full bg-[#181818] border-r border-[#262626] flex flex-col shrink-0 select-none text-[#d3d3d3] text-[13px]">
      {/* Top Brand Logo */}
      <div className="h-14 px-5 flex items-center justify-between border-b border-[#262626]/50">
        <FileDriveLogo size="md" />

        {/* Close Button on Mobile */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* MOBILE ONLY: Search and + New button inside Hamburger Drawer */}
      <div className="md:hidden p-3 space-y-2 border-b border-[#262626]/80 bg-[#161616]">
        {/* Search */}
        {onSearchChange && (
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search courses, lessons..."
              className="w-full bg-[#202020] text-neutral-200 placeholder:text-neutral-500 rounded-lg pl-9 pr-3 py-2 text-xs outline-none border border-neutral-700/80 focus:border-dropbox-blue"
            />
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
        {/* Primary nav group */}
        <div className="space-y-0.5">
          <button
            onClick={() => {
              onSelectSection("Home")
              onCloseMobile?.()
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-white/5 transition-colors font-medium"
          >
            <Home className="w-4 h-4 text-neutral-300" />
            <span>Home</span>
          </button>

          <button
            onClick={() => {
              onSelectSection("Folders")
              onCloseMobile?.()
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Folder className="w-4 h-4 text-neutral-400" />
            <span>Folders</span>
          </button>

          <button
            onClick={() => {
              onSelectSection("Activity")
              onCloseMobile?.()
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-neutral-400" />
              <span>Activity</span>
            </div>
            <span className="bg-[#e03131] text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
              33
            </span>
          </button>

        </div>

        {/* Section divider & Files categories */}
        <div className="space-y-0.5 pt-1">
          <button
            onClick={() => {
              onSelectSection("All files")
              onCloseMobile?.()
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeSection === "All files"
                ? "bg-[#2d2d2d] text-white"
                : "text-neutral-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <FileText className="w-4 h-4 text-neutral-400" />
            <span>All files</span>
          </button>

          <button
            onClick={() => {
              onSelectSection("Photos")
              onCloseMobile?.()
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Image className="w-4 h-4 text-neutral-400" />
            <span>Photos</span>
          </button>

          <button
            onClick={() => {
              onSelectSection("Shared")
              onCloseMobile?.()
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Users className="w-4 h-4 text-neutral-400" />
            <span>Shared</span>
          </button>

          <button
            onClick={() => {
              onSelectSection("File requests")
              onCloseMobile?.()
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Inbox className="w-4 h-4 text-neutral-400" />
            <span>File requests</span>
          </button>

          <button
            onClick={() => {
              onSelectSection("Deleted files")
              onCloseMobile?.()
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-neutral-400" />
            <span>Deleted files</span>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar (visible on md and up) */}
      <aside className="hidden md:flex h-screen shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (visible when isOpenMobile is true on small screens) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />
          {/* Drawer content */}
          <div className="relative z-50 h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
