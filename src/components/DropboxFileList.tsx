import React, { useState } from "react"
import {
  Folder,
  Download,
  Star,
  Eye,
} from "lucide-react"
import { Course } from "@/data/courses"

interface DropboxFileListProps {
  courses: Course[]
  onOpenExplorer: (course: Course) => void
  onInitiateDownload: (course: Course) => void
  onNewFolderClick: () => void
  onSelectGoogleDrive?: (course: Course) => void
}

export function DropboxFileList({
  courses,
  onOpenExplorer,
  onInitiateDownload,
  onNewFolderClick,
  onSelectGoogleDrive,
}: DropboxFileListProps) {
  const [activeFilter, setActiveFilter] = useState<"recents" | "starred" | "all">("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === courses.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(courses.map((c) => c.id))
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 select-none text-neutral-200">
      {/* Action Bar Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">All files</h1>
          <button className="text-neutral-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs: Recents, Starred */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveFilter("all")}
          className={`flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 ${
            activeFilter === "all"
              ? "bg-white text-black border-white"
              : "bg-[#1e1e1e] text-neutral-300 border-neutral-800 hover:bg-[#262626]"
          }`}
        >
          <span>All Courses</span>
        </button>

        <button
          onClick={() => setActiveFilter("recents")}
          className={`flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 ${
            activeFilter === "recents"
              ? "bg-white text-black border-white"
              : "bg-[#1e1e1e] text-neutral-300 border-neutral-800 hover:bg-[#262626]"
          }`}
        >
          <span>Recents</span>
        </button>

        <button
          onClick={() => setActiveFilter("starred")}
          className={`flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 ${
            activeFilter === "starred"
              ? "bg-white text-black border-white"
              : "bg-[#1e1e1e] text-neutral-300 border-neutral-800 hover:bg-[#262626]"
          }`}
        >
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>Starred</span>
        </button>
      </div>

      {/* MOBILE CARD VIEW (< md screens) - Single line title, no description, no date */}
      <div className="block md:hidden space-y-3 mb-6">
        {courses.map((course) => (
          <div
            key={course.id}
            onClick={() => onOpenExplorer(course)}
            className="p-3.5 rounded-xl bg-[#181818] border border-neutral-800 active:bg-[#202020] transition-colors space-y-3 cursor-pointer"
          >
            {/* Title on a single line + Size (no date, no description) */}
            <div className="flex items-center justify-between gap-3 min-w-0">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
                  <Folder className="w-4 h-4 fill-sky-400" />
                </div>
                <span className="font-semibold text-white text-xs sm:text-sm truncate whitespace-nowrap block min-w-0 flex-1">
                  {course.name}
                </span>
              </div>
              <span className="font-mono text-neutral-300 text-xs font-bold shrink-0 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                {course.size}
              </span>
            </div>

            {/* ONLY DOWNLOAD BUTTON */}
            <div className="pt-1 border-t border-neutral-800/80" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onInitiateDownload(course)}
                className="w-full py-2 px-3 rounded-lg bg-dropbox-blue hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE VIEW (>= md screens) - Single line title, no description, no date */}
      <div className="hidden md:block w-full bg-[#161616] border border-neutral-800/80 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-800/80 text-neutral-400 text-[11px] font-semibold uppercase tracking-wider bg-[#1a1a1a]/80">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.length === courses.length && courses.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded bg-neutral-800 border-neutral-700 text-dropbox-blue focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4 hidden sm:table-cell">Size</th>
              <th className="py-3 px-4 hidden lg:table-cell">Access</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 text-xs">
            {/* 3 Main Available Courses */}
            {courses.map((course) => {
              const isSelected = selectedIds.includes(course.id)
              return (
                <tr
                  key={course.id}
                  onClick={() => onOpenExplorer(course)}
                  className={`group hover:bg-[#202020] transition-colors cursor-pointer ${
                    isSelected ? "bg-[#252525]" : ""
                  }`}
                >
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(course.id)}
                      className="rounded bg-neutral-800 border-neutral-700 text-dropbox-blue focus:ring-0 cursor-pointer"
                    />
                  </td>

                  {/* Name on a single line - no description below */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
                        <Folder className="w-4 h-4 fill-sky-400" />
                      </div>
                      <div className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate whitespace-nowrap max-w-lg">
                        {course.name}
                      </div>
                    </div>
                  </td>

                  {/* Size */}
                  <td className="py-3.5 px-4 font-mono text-neutral-300 font-medium hidden sm:table-cell">
                    {course.size}
                  </td>

                  {/* Access */}
                  <td className="py-3.5 px-4 text-neutral-400 hidden lg:table-cell">
                    <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-[11px] text-neutral-300">
                      {course.access}
                    </span>
                  </td>

                  {/* Clean Action - ONLY Download button */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => onInitiateDownload(course)}
                        className="px-3.5 py-1.5 rounded-lg bg-dropbox-blue hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
