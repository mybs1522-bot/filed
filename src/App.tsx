import React, { useState, useEffect } from "react"
import { COURSES, Course } from "@/data/courses"
import { Node } from "@/components/ui/filesystem-item"
import { DropboxSidebar } from "@/components/DropboxSidebar"
import { DropboxHeader } from "@/components/DropboxHeader"
import { DropboxFileList } from "@/components/DropboxFileList"
import { DownloadModal } from "@/components/DownloadModal"
import { SlowDownloadWidget, DownloadSession } from "@/components/SlowDownloadWidget"
import { GoogleDriveLinksModal } from "@/components/GoogleDriveLinksModal"
import { CourseExplorerModal } from "@/components/CourseExplorerModal"
import { DocsGuideModal } from "@/components/DocsGuideModal"
import { AuthScreen, UserAccount } from "@/components/AuthScreen"
import { AdminPortal } from "@/components/AdminPortal"
import { SettingsModal } from "@/components/SettingsModal"
import { getCoursesList, recordUserLogin, fetchUserSubscription } from "@/lib/supabaseService"
import { getUserSubscription, saveUserSubscription, addInvoice } from "@/lib/billingService"
import { ShieldCheck, Database } from "lucide-react"

export function App() {
  const [courses, setCourses] = useState<Course[]>(COURSES)
  const [activeSection, setActiveSection] = useState("All files")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Admin Route state: check /admin pathname or #admin hash
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname.toLowerCase()
      const hash = window.location.hash.toLowerCase()
      return path === "/admin" || path.startsWith("/admin") || hash === "#admin"
    }
    return false
  })

  // Synchronize route when back/forward or hash changes
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname.toLowerCase()
      const hash = window.location.hash.toLowerCase()
      setIsAdmin(path === "/admin" || path.startsWith("/admin") || hash === "#admin")
    }

    window.addEventListener("popstate", handleRouteChange)
    window.addEventListener("hashchange", handleRouteChange)
    return () => {
      window.removeEventListener("popstate", handleRouteChange)
      window.removeEventListener("hashchange", handleRouteChange)
    }
  }, [])

  const navigateToAdmin = () => {
    try {
      window.history.pushState(null, "", "/admin")
    } catch {
      window.location.hash = "#admin"
    }
    setIsAdmin(true)
  }

  const navigateToApp = () => {
    try {
      window.history.pushState(null, "", "/")
    } catch {
      window.location.hash = ""
    }
    setIsAdmin(false)
  }

  // Load courses from Supabase
  const loadCourses = async () => {
    try {
      const list = await getCoursesList()
      if (list && list.length > 0) {
        setCourses(list)
      }
    } catch (err) {
      console.warn("Could not load courses from Supabase:", err)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  // Authentication State: Persisted in localStorage
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem("filedrive_account")
      if (!saved) return null
      const parsed = JSON.parse(saved)
      if (parsed && typeof parsed === "object" && parsed.email && parsed.username) {
        return parsed
      }
      return null
    } catch {
      return null
    }
  })

  // Record user login if current user exists on load and sync subscription
  useEffect(() => {
    if (currentUser?.email && currentUser?.username) {
      recordUserLogin(currentUser.email, currentUser.username)
      fetchUserSubscription(currentUser.email).then(sub => {
        if (sub && sub.status === "active") {
          saveUserSubscription(sub);
        }
      }).catch(console.error);
    }
  }, [currentUser])

  // Modals state
  const [explorerCourse, setExplorerCourse] = useState<Course | null>(null)
  const [downloadModalCourse, setDownloadModalCourse] = useState<Course | null>(null)
  const [downloadModalFileTarget, setDownloadModalFileTarget] = useState<{
    name: string
    size?: string
  } | null>(null)

  const [googleDriveCourse, setGoogleDriveCourse] = useState<Course | null>(null)
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  // Listen for PayPal success return URL and unlock immediately
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("paypal=success")) {
      const target = courses[0]
      if (target) {
        if (currentUser) {
           const sub = {
             id: `paypal-sub-${Date.now()}`,
             userEmail: currentUser.email,
             provider: "paypal" as const,
             planName: "PayPal VIP (Direct CDN)",
             billingCycle: "monthly" as const,
             amount: 12.0,
             currency: "USD",
             status: "active" as const,
             startDate: new Date().toISOString(),
             currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString()
           };
           saveUserSubscription(sub);

           addInvoice({
             id: `INV-${new Date().getFullYear()}-FD-${Math.floor(Math.random() * 9000 + 1000)}`,
             subscriptionId: sub.id,
             userEmail: currentUser.email,
             date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
             description: "High-Speed VIP Direct Access - Monthly Recurring",
             amount: 12.0,
             currency: "USD",
             provider: "paypal",
             status: "Paid",
             period: `${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${new Date(Date.now() + 30 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
             receiptNumber: `REC-${Math.floor(Math.random() * 900000 + 100000)}`,
             paypalEmail: currentUser.email,
           });
        }
        setGoogleDriveCourse(target)
        setBillingCycle("monthly")
        try {
          window.history.replaceState({}, document.title, window.location.pathname)
        } catch {
          // ignore
        }
      }
    }

    // Listen for Stripe Checkout success return
    if (typeof window !== "undefined" && window.location.search.includes("stripe=success")) {
      const target = courses[0]
      if (target) {
        if (currentUser) {
           const sub = {
             id: `stripe-sub-${Date.now()}`,
             userEmail: currentUser.email,
             provider: "stripe" as const,
             planName: "Stripe VIP (Direct CDN)",
             billingCycle: "monthly" as const,
             amount: 12.0,
             currency: "USD",
             status: "active" as const,
             startDate: new Date().toISOString(),
             currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString()
           };
           saveUserSubscription(sub);

           addInvoice({
             id: `INV-${new Date().getFullYear()}-FD-${Math.floor(Math.random() * 9000 + 1000)}`,
             subscriptionId: sub.id,
             userEmail: currentUser.email,
             date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
             description: "High-Speed VIP Direct Access - Monthly Recurring",
             amount: 12.0,
             currency: "USD",
             provider: "stripe",
             status: "Paid",
             period: `${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${new Date(Date.now() + 30 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
             receiptNumber: `REC-${Math.floor(Math.random() * 900000 + 100000)}`,
             cardLast4: "••••",
           });
        }
        setGoogleDriveCourse(target)
        setBillingCycle("monthly")
        try {
          window.history.replaceState({}, document.title, window.location.pathname)
        } catch {
          // ignore
        }
      }
    }
  }, [courses, currentUser])

  // Auth modal triggered when clicking download without an account
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [pendingDownloadAction, setPendingDownloadAction] = useState<{
    course: Course
    fileTarget?: { name: string; size?: string } | null
  } | null>(null)

  // Active Slow Download session
  const [slowDownloadSession, setSlowDownloadSession] = useState<DownloadSession | null>(null)

  // Filter courses by search query
  const filteredCourses = courses.filter((course) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      course.name.toLowerCase().includes(q) ||
      course.tagline.toLowerCase().includes(q)
    )
  })

  // Login handler
  const handleLogin = async (account: UserAccount) => {
    setCurrentUser(account)
    try {
      localStorage.setItem("filedrive_account", JSON.stringify(account))
    } catch (err) {
      console.error(err)
    }
    // Record login into Supabase user_logins
    recordUserLogin(account.email, account.username)
    
    // Sync subscription from Supabase
    try {
      const sub = await fetchUserSubscription(account.email);
      if (sub && sub.status === "active") {
        saveUserSubscription(sub);
      }
    } catch (e) {
      console.error("Failed to sync sub", e);
    }
    
    setIsAuthModalOpen(false)

    // Resume the download that triggered the signup
    if (pendingDownloadAction) {
      setDownloadModalCourse(pendingDownloadAction.course)
      setDownloadModalFileTarget(pendingDownloadAction.fileTarget || null)
      setPendingDownloadAction(null)
    }
  }

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null)
    try {
      localStorage.removeItem("filedrive_account")
    } catch (err) {
      console.error(err)
    }
  }

  // Start Slow 4GB download simulation
  const handleStartSlowDownload = (
    course: Course,
    targetName?: string,
    targetSize?: string
  ) => {
    const randomGb = parseFloat((3.98 + Math.random() * 0.35).toFixed(2))
    const totalBytes = randomGb * 1024 * 1024 * 1024

    const fileName = targetName
      ? `${targetName}`
      : `${course.name.replace(/\s+/g, "_")}_Complete_v2025.zip`

    setSlowDownloadSession({
      id: `download-${Date.now()}`,
      courseId: course.id,
      fileName: fileName,
      totalBytes: totalBytes,
      downloadedBytes: 1024 * 1024 * 1.5, // Initial ~1.5 MB
      speedKbps: Math.floor(80 + Math.random() * 41), // initial 80-120 kbps
      isPaused: false,
      startedAt: Date.now(),
    })
  }

  // Open download modal for course (Requires signup first!)
  const handleInitiateDownload = (course: Course) => {
    if (!currentUser) {
      setPendingDownloadAction({ course, fileTarget: null })
      setIsAuthModalOpen(true)
      return
    }
    
    // Check if user has an active subscription
    const sub = getUserSubscription(currentUser.email);
    if (sub && sub.status === "active") {
      // Bypass upgrade modal, show unlocked links directly
      setBillingCycle(sub.billingCycle);
      setGoogleDriveCourse(course);
      return;
    }

    setDownloadModalCourse(course)
    setDownloadModalFileTarget(null)
  }

  // Open download modal for specific sub-file (Requires signup first!)
  const handleInitiateFileDownload = (course: Course, fileNode: Node) => {
    const fileTarget = {
      name: fileNode.name,
      size: fileNode.size || "120 MB",
    }
    if (!currentUser) {
      setPendingDownloadAction({ course, fileTarget })
      setIsAuthModalOpen(true)
      return
    }

    // Check if user has an active subscription
    const sub = getUserSubscription(currentUser.email);
    if (sub && sub.status === "active") {
      // Bypass upgrade modal, show unlocked links directly
      setBillingCycle(sub.billingCycle);
      setGoogleDriveCourse(course);
      return;
    }

    setDownloadModalCourse(course)
    setDownloadModalFileTarget(fileTarget)
  }

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  // Fast direct upgrade
  const handleOpenGoogleDriveModal = (course?: Course, cycle: "monthly" | "yearly" = "monthly") => {
    const target = course || courses[0]
    setBillingCycle(cycle)
    if (!currentUser) {
      setPendingDownloadAction({ course: target, fileTarget: null })
      setIsAuthModalOpen(true)
      return
    }
    setGoogleDriveCourse(target)
  }

  // Add dummy folder
  const handleCreateNewFolder = () => {
    const folderName = prompt("Enter new folder or course bundle name:")
    if (folderName?.trim()) {
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        name: folderName.trim(),
        tagline: "Custom course bundle created by you",
        size: "4.10 GB",
        sizeBytes: 4.1 * 1024 * 1024 * 1024,
        lastModified: "Just now",
        access: "Only you",
        starred: false,
        googleDriveUrl: "https://drive.google.com/drive/folders/custom-bundle",
        rootNode: {
          name: folderName.trim(),
          nodes: [
            { name: "Course_Syllabus.pdf", size: "3.2 MB" },
            { name: "Raw_Lesson_Videos", nodes: [{ name: "Intro_01.mp4", size: "640 MB" }] },
          ],
        },
      }
      setCourses([newCourse, ...courses])
    }
  }

  // 0. ADMIN ROUTE: If user navigated to /admin or clicked Admin Portal
  if (isAdmin) {
    return <AdminPortal onBackToApp={navigateToApp} onCourseAdded={loadCourses} />
  }

  const activeSub = currentUser ? getUserSubscription(currentUser.email) : null
  const isSubscribed = activeSub?.status === "active"

  // 1. Render the full FileDrive page (Open by default; signup opens when user clicks download)
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#121212] text-neutral-100 font-sans antialiased">
      {/* 1. Left FileDrive Navigation Rail / Sidebar (Responsive Mobile Drawer + Desktop) */}
      <DropboxSidebar
        courses={courses}
        activeSection={activeSection}
        onSelectSection={(sec) => setActiveSection(sec)}
        onSelectCourse={(course) => setExplorerCourse(course)}
        onUpgradeClick={() => handleOpenGoogleDriveModal(courses[0])}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewFolderClick={handleCreateNewFolder}
        isSubscribed={isSubscribed}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#121212]">
        {/* Top Header showing email username in place of sign in and mobile hamburger */}
        <DropboxHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onUpgradeClick={() => handleOpenGoogleDriveModal(courses[0])}
          onNewFolderClick={handleCreateNewFolder}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          isSubscribed={isSubscribed}
        />

        {/* File Table / Course Portal (Mobile cards + Desktop table) */}
        <DropboxFileList
          courses={filteredCourses}
          onOpenExplorer={(course) => setExplorerCourse(course)}
          onInitiateDownload={handleInitiateDownload}
          onSelectGoogleDrive={(course) => handleOpenGoogleDriveModal(course)}
          onNewFolderClick={handleCreateNewFolder}
        />

        {/* Bottom Floating Bar */}
        <div className="px-3 sm:px-6 md:px-8 py-2.5 bg-[#161616] border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse shrink-0" />
            <span className="text-neutral-300 font-medium truncate">FileDrive Cloud Active</span>
            <span className="text-neutral-600 hidden sm:inline">•</span>
            {currentUser ? (
              <span className="text-neutral-300 hidden md:inline truncate">
                Signed in as <strong className="text-white font-mono">@{currentUser.username}</strong>
              </span>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-neutral-400 hover:text-white hidden md:inline truncate underline underline-offset-2"
              >
                Sign In to Download
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Download Options Modal (Slow Free vs $20 Google Drive) */}
      <DownloadModal
        course={downloadModalCourse}
        fileTarget={downloadModalFileTarget}
        isOpen={!!downloadModalCourse}
        onClose={() => {
          setDownloadModalCourse(null)
          setDownloadModalFileTarget(null)
        }}
        onSelectSlow={handleStartSlowDownload}
        onSelectGoogleDrive={(course, cycle) => {
          handleOpenGoogleDriveModal(course, cycle || "monthly")
        }}
      />

      {/* 4. Slow 4GB Download Simulation Widget (using black & white FileTransferCard with vivid GREEN progress bar) */}
      <SlowDownloadWidget
        session={slowDownloadSession}
        username={currentUser?.username}
        onCancel={() => setSlowDownloadSession(null)}
        onUpgradeToFast={() => {
          const targetCourse = courses.find((c) => c.id === slowDownloadSession?.courseId) || courses[0]
          handleOpenGoogleDriveModal(targetCourse, "monthly")
        }}
      />

      {/* 5. Google Drive Direct Links ($20 VIP) Modal */}
      <GoogleDriveLinksModal
        course={googleDriveCourse}
        isOpen={!!googleDriveCourse}
        billingCycle={billingCycle}
        userEmail={currentUser?.email}
        onPaymentSuccess={() => {
          setSlowDownloadSession(null)
        }}
        onClose={() => setGoogleDriveCourse(null)}
      />

      {/* 6. Interactive Course Explorer with FilesystemItem */}
      <CourseExplorerModal
        course={explorerCourse}
        isOpen={!!explorerCourse}
        onClose={() => setExplorerCourse(null)}
        onDownloadCourse={handleInitiateDownload}
        onDownloadFile={handleInitiateFileDownload}
      />

      {/* 7. Setup & Architecture Docs Modal */}
      <DocsGuideModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
      />

      {/* 8. Settings & Billing Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentUser={currentUser}
        onUpgradeClick={() => handleOpenGoogleDriveModal(courses[0], "monthly")}
      />

      {/* 9. Auth Modal (Opens when clicking download or Sign In without an account) */}
      <AuthScreen
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false)
          setPendingDownloadAction(null)
        }}
        onLogin={handleLogin}
      />
    </div>
  )
}

export default App
