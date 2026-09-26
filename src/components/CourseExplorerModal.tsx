import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Download, Folder } from "lucide-react"
import { Course } from "@/data/courses"
import { FilesystemItem } from "@/components/ui/filesystem-item"

interface CourseExplorerModalProps {
  course: Course | null
  isOpen: boolean
  onClose: () => void
  onDownloadCourse: (course: Course) => void
  onDownloadFile?: (course: Course, fileNode: any) => void
}

export function CourseExplorerModal({
  course,
  isOpen,
  onClose,
  onDownloadCourse,
}: CourseExplorerModalProps) {
  if (!isOpen || !course) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-[#1b1b1b] border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-neutral-100"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-neutral-800 bg-[#212121] gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <Folder className="w-4 h-4 sm:w-5 sm:h-5 fill-sky-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm sm:text-base text-white truncate">{course.name}</h3>
                <p className="text-[11px] sm:text-xs text-neutral-400 truncate">{course.tagline}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={() => onDownloadCourse(course)}
                className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-dropbox-blue hover:bg-blue-600 text-xs font-semibold text-white flex items-center gap-1.5 shadow transition-colors active:scale-95"
                title="Download Entire Course"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>Download</span>
                <span className="hidden sm:inline">Entire Course</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>



          {/* Main Tree Container */}
          <div className="p-6 overflow-y-auto flex-1 bg-[#141414]">
            <div className="space-y-4">
              <div className="bg-[#1a1a1a] p-4 rounded-xl border border-neutral-800 shadow-inner">
                <ul className="space-y-1">
                  <FilesystemItem
                    node={course.rootNode}
                    animated={true}
                    readOnly={true}
                  />
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
