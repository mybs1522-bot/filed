"use client"

import { useState } from "react"
import { ChevronRight, Folder, File } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export type Node = {
  name: string
  nodes?: Node[]
  size?: string
  modified?: string
  badge?: string
}

export interface FilesystemItemProps {
  node: Node
  animated?: boolean
  onSelect?: (node: Node) => void
  onDownload?: (node: Node) => void
  readOnly?: boolean
  showSize?: boolean
}

export function FilesystemItem({
  node,
  animated = false,
  onSelect,
  onDownload,
  readOnly = true,
  showSize = false,
}: FilesystemItemProps) {
  let [isOpen, setIsOpen] = useState(false)

  // Chevron animation
  const ChevronIcon = () =>
    animated ? (
      <motion.span
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="flex"
      >
        <ChevronRight className="size-4 text-gray-500" />
      </motion.span>
    ) : (
      <ChevronRight
        className={`size-4 text-gray-500 ${isOpen ? "rotate-90" : ""}`}
      />
    )

  const ChildrenList = () => {
    const children = node.nodes?.map((child) => (
      <FilesystemItem
        node={child}
        key={child.name}
        animated={animated}
        onSelect={onSelect}
        onDownload={readOnly ? undefined : onDownload}
        readOnly={readOnly}
        showSize={showSize}
      />
    ))

    if (animated) {
      return (
        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="pl-6 overflow-hidden flex flex-col justify-end"
            >
              {children}
            </motion.ul>
          )}
        </AnimatePresence>
      )
    }

    return isOpen && <ul className="pl-6">{children}</ul>
  }

  const isFolder = Boolean(node.nodes && node.nodes.length >= 0)

  return (
    <li key={node.name} className="list-none group">
      <div className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-white/[0.03] transition-colors text-sm text-gray-200">
        <span
          className={`flex items-center gap-1.5 flex-1 select-none ${
            isFolder ? "cursor-pointer" : "cursor-default"
          }`}
          onClick={() => {
            if (isFolder) {
              setIsOpen(!isOpen)
            }
            if (!readOnly) {
              onSelect?.(node)
            }
          }}
        >
          {node.nodes && node.nodes.length > 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(!isOpen)
              }}
              className="p-1 -m-1 text-gray-400 hover:text-white cursor-pointer"
            >
              <ChevronIcon />
            </button>
          ) : (
            <span className="w-4" />
          )}

          {node.nodes ? (
            <Folder
              className={`size-5 text-sky-400 fill-sky-400/80 ${
                node.nodes.length === 0 ? "ml-0" : ""
              }`}
            />
          ) : (
            <File className="size-5 text-neutral-400" />
          )}
          <span className="font-medium text-gray-200 truncate select-none">
            {node.name}
          </span>
          {showSize && node.size && (
            <span className="text-xs text-neutral-400 font-mono ml-2 shrink-0 select-none">
              ({node.size})
            </span>
          )}
        </span>

        {!readOnly && onDownload && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDownload(node)
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-dropbox-blue hover:bg-blue-600 text-white font-medium px-2 py-1 rounded shadow-sm flex items-center gap-1"
          >
            Download
          </button>
        )}
      </div>

      <ChildrenList />
    </li>
  )
}
