import React from "react"
import { FilesystemItem, Node } from "@/components/ui/filesystem-item"

const sampleTree: Node = {
  name: "Course_Bundle_Root",
  nodes: [
    {
      name: "01_Module_Introduction",
      nodes: [
        { name: "01_Welcome.mp4", size: "145 MB" },
        { name: "Course_Syllabus.pdf", size: "2.4 MB" },
      ],
    },
    {
      name: "02_Source_Assets",
      nodes: [
        { name: "Project_Scene_v1.zip", size: "1.85 GB" },
        { name: "Textures_4K.zip", size: "1.20 GB" },
      ],
    },
    {
      name: "README_Instructions.txt",
      size: "14 KB",
    },
  ],
}

export function FilesystemItemDemo() {
  return (
    <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
      <FilesystemItem node={sampleTree} animated={false} />
    </div>
  )
}

export function FilesystemItemAnimatedDemo() {
  return (
    <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
      <FilesystemItem node={sampleTree} animated={true} />
    </div>
  )
}
