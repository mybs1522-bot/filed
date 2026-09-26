import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Database,
  Plus,
  Link as LinkIcon,
  Users,
  FolderPlus,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ArrowLeft,
  FileText,
  Clock,
  HardDrive,
  Trash2,
  RefreshCw,
  Search,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  LogOut,
  Key,
} from "lucide-react"
import {
  addCourseRecord,
  getCoursesList,
  getUserLoginsList,
  removeCourseRecord,
  restoreRemovedCourses,
  getRemovedCourseIds,
  UserLoginRecord,
  recordUserSubscription,
} from "@/lib/supabaseService"
import { Course } from "@/data/courses"
import { SUPABASE_URL } from "@/lib/supabase"

interface AdminPortalProps {
  onBackToApp: () => void
  onCourseAdded?: () => void
}

export function AdminPortal({ onBackToApp, onCourseAdded }: AdminPortalProps) {
  // Admin authentication state: only accessible with robbin / Robbin#00
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("filedrive_admin_auth") === "true"
    } catch {
      return false
    }
  })

  // Admin login credentials state
  const [adminUsername, setAdminUsername] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [adminError, setAdminError] = useState("")
  const [showAdminPassword, setShowAdminPassword] = useState(false)

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setAdminError("")

    const userClean = adminUsername.trim().toLowerCase()
    const passClean = adminPassword.trim()

    // Strict credential check: username 'robbin', password 'Robbin#00'
    if (userClean === "robbin" && passClean === "Robbin#00") {
      try {
        sessionStorage.setItem("filedrive_admin_auth", "true")
      } catch (err) {
        console.error(err)
      }
      setIsAdminAuth(true)
      setAdminError("")
    } else {
      setAdminError("Invalid administrator credentials. Access restricted.")
    }
  }

  const handleAdminLogout = () => {
    try {
      sessionStorage.removeItem("filedrive_admin_auth")
    } catch (err) {
      console.error(err)
    }
    setIsAdminAuth(false)
    setAdminPassword("")
    setAdminUsername("")
  }

  const [activeTab, setActiveTab] = useState<"files" | "logins" | "sql">("files")
  const [courses, setCourses] = useState<Course[]>([])
  const [logins, setLogins] = useState<UserLoginRecord[]>([])
  const [loading, setLoading] = useState(false)

  // Form state for adding file name and drive link
  const [fileName, setFileName] = useState("")
  const [driveLink, setDriveLink] = useState("")
  const [fileSize, setFileSize] = useState("4.18 GB")
  const [submitStatus, setSubmitStatus] = useState<string | null>(null)
  const [searchUser, setSearchUser] = useState("")
  const [copiedSql, setCopiedSql] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [cList, uList] = await Promise.all([
        getCoursesList(),
        getUserLoginsList(),
      ])
      setCourses(cList)
      setLogins(uList)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdminAuth) {
      loadData()
    }
  }, [isAdminAuth])

  const handleAddFile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fileName.trim() || !driveLink.trim()) {
      alert("Please provide both file name and Google Drive link.")
      return
    }

    setSubmitStatus("saving")
    const res = await addCourseRecord(fileName, driveLink, fileSize)

    if (res.success) {
      setSubmitStatus("success")
      setFileName("")
      setDriveLink("")
      await loadData()
      onCourseAdded?.()
      setTimeout(() => setSubmitStatus(null), 3000)
    } else {
      setSubmitStatus("error")
    }
  }

  const handleEnableVIP = async (userEmail: string) => {
    try {
      await recordUserSubscription({
        id: `VIP-ADMIN-${Date.now()}`,
        userEmail,
        provider: "admin",
        planName: "Admin Enabled VIP (Direct CDN)",
        billingCycle: "monthly",
        status: "active",
        startDate: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString() // 30 days
      });
      alert(`VIP access enabled successfully for ${userEmail}.`);
    } catch (e) {
      alert("Failed to enable VIP access.");
    }
  }

  const [removingId, setRemovingId] = useState<string | null>(null)
  const [removeMessage, setRemoveMessage] = useState<string | null>(null)

  const handleRemoveCourse = async (course: Course) => {
    const confirmed = window.confirm(`Are you sure you want to remove "${course.name}" from FileDrive?`)
    if (!confirmed) return

    setRemovingId(course.id)
    try {
      await removeCourseRecord(course.id)
      setRemoveMessage(`Removed "${course.name}" successfully!`)
      await loadData()
      onCourseAdded?.()
      setTimeout(() => setRemoveMessage(null), 3000)
    } catch (err: any) {
      alert("Failed to remove course: " + (err?.message || "Unknown error"))
    } finally {
      setRemovingId(null)
    }
  }

  const handleRestoreDefaults = async () => {
    if (window.confirm("Restore all previously removed default courses?")) {
      restoreRemovedCourses()
      await loadData()
      onCourseAdded?.()
      setRemoveMessage("All default courses restored successfully!")
      setTimeout(() => setRemoveMessage(null), 3000)
    }
  }

  const sqlSchema = `-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jjljunwwckeqvifedcne/sql

-- 1. Create courses table
create table if not exists public.courses (
  id text primary key,
  name text not null,
  google_drive_url text not null,
  size text default '4.18 GB',
  size_bytes bigint default 4488105984,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create user_logins table
create table if not exists public.user_logins (
  id text primary key,
  email text not null,
  username text not null,
  device text,
  logged_in_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable public access for your web client
alter table public.courses enable row level security;
drop policy if exists "Public courses access" on public.courses;
create policy "Public courses access" on public.courses for all using (true) with check (true);

alter table public.user_logins enable row level security;
drop policy if exists "Public user_logins access" on public.user_logins;
create policy "Public user_logins access" on public.user_logins for all using (true) with check (true);`

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 2000)
  }

  const filteredLogins = logins.filter((log) => {
    if (!searchUser.trim()) return true
    const q = searchUser.toLowerCase()
    return log.email.toLowerCase().includes(q) || log.username.toLowerCase().includes(q)
  })

  // 1. GATE: If admin is not authenticated, show the secure Administrator Login Screen
  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-[#121212] text-neutral-100 flex flex-col items-center justify-center p-4 font-sans select-none relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm bg-[#1a1a1a] border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10 space-y-5">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-3 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">FileDrive /admin</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Restricted Area • Administrator Authentication Required
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            {/* Username */}
            <div>
              <label className="block text-neutral-300 font-medium mb-1.5">
                Admin Username
              </label>
              <input
                type="text"
                required
                autoFocus
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="robbin"
                className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-neutral-300 font-medium mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showAdminPassword ? "text" : "password"}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {adminError && (
              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{adminError}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-500/10 active:scale-[0.99]"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Unlock Admin Portal</span>
            </button>
          </form>

          {/* Return to App */}
          <div className="pt-2 border-t border-neutral-800 text-center">
            <button
              onClick={onBackToApp}
              className="text-neutral-400 hover:text-white text-xs inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to FileDrive</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 2. Authenticated Admin Portal View
  return (
    <div className="min-h-screen bg-[#121212] text-neutral-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="h-16 bg-[#181818] border-b border-neutral-800 px-4 sm:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToApp}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to FileDrive</span>
          </button>
          <div className="h-6 w-px bg-neutral-800 mx-1 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <h1 className="font-bold text-white text-base">FileDrive /admin</h1>
          </div>
        </div>

        {/* Right Header items */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin badge */}
          <div className="px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-700/80 text-xs text-neutral-200 hidden sm:flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-emerald-300 font-bold">@robbin</span>
          </div>

          {/* Supabase Status Pill */}
          <div className="px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden md:inline font-mono text-[11px] truncate max-w-[180px]">
              jjljunwwckeqvifedcne.supabase.co
            </span>
            <span className="font-bold">Connected</span>
          </div>

          <button
            onClick={loadData}
            title="Refresh Data"
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          {/* Lock / Log Out Button */}
          <button
            onClick={handleAdminLogout}
            title="Lock Admin Portal"
            className="px-2.5 py-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lock</span>
          </button>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <div className="bg-[#161616] border-b border-neutral-800 px-4 sm:px-8 flex items-center gap-2 text-xs">
        <button
          onClick={() => setActiveTab("files")}
          className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "files"
              ? "border-dropbox-blue text-white"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <FolderPlus className="w-4 h-4" />
          <span>Manage Files &amp; Drive Links</span>
          <span className="px-1.5 py-0.2 rounded-full bg-neutral-800 text-[10px] text-neutral-300">
            {courses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("logins")}
          className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "logins"
              ? "border-dropbox-blue text-white"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Login Activity</span>
          <span className="px-1.5 py-0.2 rounded-full bg-neutral-800 text-[10px] text-neutral-300">
            {logins.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("sql")}
          className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "sql"
              ? "border-dropbox-blue text-white"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Supabase SQL Setup</span>
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
        {/* TAB 1: FILES & GOOGLE DRIVE LINKS */}
        {activeTab === "files" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Form to Add File Name & Drive Link */}
            <div className="lg:col-span-1 bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
                <FolderPlus className="w-4 h-4 text-dropbox-blue" />
                <h3 className="font-bold text-white text-sm">Add New File / Course</h3>
              </div>

              <form onSubmit={handleAddFile} className="space-y-4 text-xs">
                {/* File Name */}
                <div>
                  <label className="block text-neutral-300 font-medium mb-1.5">
                    File / Course Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="e.g. AutoCAD 2026 Complete Suite"
                    className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-dropbox-blue"
                  />
                </div>

                {/* Google Drive Link */}
                <div>
                  <label className="block text-neutral-300 font-medium mb-1.5 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Google Drive Direct Link</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-neutral-500 font-mono outline-none focus:border-dropbox-blue"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Users choosing &quot;Google Drive Direct Links ($20)&quot; will get this link.
                  </p>
                </div>

                {/* File Size */}
                <div>
                  <label className="block text-neutral-300 font-medium mb-1.5">
                    File Size
                  </label>
                  <input
                    type="text"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    placeholder="4.18 GB"
                    className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl px-3 py-2.5 text-xs text-white font-mono outline-none focus:border-dropbox-blue"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitStatus === "saving"}
                  className="w-full py-2.5 px-4 rounded-xl bg-dropbox-blue hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {submitStatus === "saving" ? "Saving to Supabase..." : "Save File to FileDrive"}
                  </span>
                </button>

                {submitStatus === "success" && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>File &amp; Drive Link saved successfully!</span>
                  </div>
                )}
              </form>
            </div>

            {/* Right Column: Existing Files List */}
            <div className="lg:col-span-2 bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">Active Courses &amp; Files</h3>
                  <span className="text-xs text-neutral-400 font-mono">({courses.length})</span>
                </div>
                {getRemovedCourseIds().length > 0 && (
                  <button
                    onClick={handleRestoreDefaults}
                    className="text-[11px] text-neutral-400 hover:text-white underline underline-offset-2 flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Restore ({getRemovedCourseIds().length}) Removed</span>
                  </button>
                )}
              </div>

              {removeMessage && (
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{removeMessage}</span>
                </div>
              )}

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {courses.length === 0 ? (
                  <div className="py-8 text-center text-neutral-500 text-xs">
                    No active courses. Add a new course using the form on the left!
                  </div>
                ) : (
                  courses.map((course) => (
                    <div
                      key={course.id}
                      className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white truncate max-w-md">
                          {course.name}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                          <span className="font-mono text-emerald-400 font-bold">{course.size}</span>
                          <span>•</span>
                          <a
                            href={course.googleDriveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-400 hover:underline truncate max-w-[260px] inline-flex items-center gap-1"
                          >
                            <LinkIcon className="w-3 h-3 shrink-0" />
                            <span className="truncate">{course.googleDriveUrl}</span>
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={course.googleDriveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-medium flex items-center gap-1 border border-neutral-700 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Test Link</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleRemoveCourse(course)}
                          disabled={removingId === course.id}
                          title={`Remove "${course.name}"`}
                          className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 border border-red-500/30 text-[11px] font-medium flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                          <span>{removingId === course.id ? "Removing..." : "Remove"}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER LOGIN RECORDS */}
        {activeTab === "logins" && (
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
              <div>
                <h3 className="font-bold text-white text-base">User Login History (Supabase)</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Every user who signs up or logs into FileDrive with Email &amp; Password is saved here.
                </p>
              </div>

              {/* Search user */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Filter by email or username..."
                  className="bg-neutral-900 border border-neutral-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 outline-none w-60"
                />
              </div>
            </div>

            {filteredLogins.length === 0 ? (
              <div className="py-12 text-center text-neutral-500 text-xs">
                No user logins recorded yet. When a user logs in on the main screen, their account data will automatically appear here!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-400 text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Username</th>
                      <th className="py-2.5 px-3">Email Address</th>
                      <th className="py-2.5 px-3">Device</th>
                      <th className="py-2.5 px-3">Login Time</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-mono">
                    {filteredLogins.map((record, idx) => (
                      <tr key={`${record.id}-${idx}`} className="hover:bg-neutral-900/50">
                        <td className="py-3 px-3 font-semibold text-white font-sans">
                          @{record.username}
                        </td>
                        <td className="py-3 px-3 text-neutral-300">
                          {record.email}
                        </td>
                        <td className="py-3 px-3 text-neutral-400 font-sans">
                          {record.device}
                        </td>
                        <td className="py-3 px-3 text-neutral-400">
                          {new Date(record.logged_in_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-sans">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                            Authenticated
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-sans">
                          <button
                            onClick={() => handleEnableVIP(record.email)}
                            className="px-3 py-1 rounded bg-dropbox-blue hover:bg-blue-600 text-white text-[10px] font-semibold transition-colors shadow-sm"
                          >
                            Enable VIP
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SUPABASE 1-CLICK SQL SCRIPT */}
        {activeTab === "sql" && (
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="font-bold text-white text-base">Supabase SQL Schema Setup</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  To persist courses and user logins directly into your Supabase database, copy and run this SQL once in your Supabase project.
                </p>
              </div>

              <a
                href="https://supabase.com/dashboard/project/jjljunwwckeqvifedcne/sql"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>Open Supabase SQL Editor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="relative bg-black/80 rounded-xl p-4 border border-neutral-800 font-mono text-xs text-emerald-300">
              <button
                onClick={handleCopySql}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-sans font-medium flex items-center gap-1.5 border border-neutral-700 transition-colors"
              >
                {copiedSql ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
              <pre className="overflow-x-auto pr-24 leading-relaxed">{sqlSchema}</pre>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
