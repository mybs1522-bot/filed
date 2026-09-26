import { supabase } from "@/lib/supabase"
import { Course, COURSES } from "@/data/courses"

export interface UserLoginRecord {
  id: string
  email: string
  username: string
  device: string
  logged_in_at: string
}

export interface SupabaseCourseRecord {
  id: string
  name: string
  google_drive_url: string
  size: string
  size_bytes?: number
  created_at?: string
}

const LOCAL_STORAGE_COURSES_KEY = "filedrive_custom_courses"
const LOCAL_STORAGE_REMOVED_COURSES_KEY = "filedrive_removed_courses"
const LOCAL_STORAGE_LOGINS_KEY = "filedrive_user_logins"

export function getRemovedCourseIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_REMOVED_COURSES_KEY) || "[]")
  } catch {
    return []
  }
}

export function restoreRemovedCourses(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_REMOVED_COURSES_KEY)
  } catch (err) {
    console.warn(err)
  }
}

// Remove a course from Supabase and local catalog
export async function removeCourseRecord(
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Mark as removed locally
    const removed = getRemovedCourseIds()
    if (!removed.includes(courseId)) {
      removed.push(courseId)
      localStorage.setItem(LOCAL_STORAGE_REMOVED_COURSES_KEY, JSON.stringify(removed))
    }

    // 2. Also remove from local custom courses if it was added dynamically
    const custom = JSON.parse(localStorage.getItem(LOCAL_STORAGE_COURSES_KEY) || "[]")
    const updatedCustom = custom.filter((item: any) => item.id !== courseId)
    localStorage.setItem(LOCAL_STORAGE_COURSES_KEY, JSON.stringify(updatedCustom))
  } catch (err) {
    console.warn("Local storage removal error:", err)
  }

  // 3. Delete from Supabase if present
  try {
    const { error } = await supabase.from("courses").delete().eq("id", courseId)
    if (error) {
      console.warn("Supabase course delete note:", error.message)
    }
  } catch (err: any) {
    console.warn("Supabase delete failed:", err?.message)
  }

  return { success: true }
}

// Fetch all courses (from Supabase + initial defaults, excluding removed)
export async function getCoursesList(): Promise<Course[]> {
  const removedIds = getRemovedCourseIds()

  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.warn("Supabase courses table query note:", error.message)
      return getLocalCourses().filter((c) => !removedIds.includes(c.id))
    }

    if (data && data.length > 0) {
      const customCourses: Course[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        tagline: "Custom course bundle added via FileDrive Admin",
        size: item.size || "4.18 GB",
        sizeBytes: item.size_bytes || 4.18 * 1024 * 1024 * 1024,
        lastModified: new Date(item.created_at || Date.now()).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        access: "Only you",
        starred: true,
        googleDriveUrl: item.google_drive_url,
        rootNode: {
          name: item.name,
          nodes: [
            { name: "Course_Files_Direct.zip", size: item.size || "4.18 GB" },
            { name: "Google_Drive_Direct_Link.txt", size: "2 KB" },
          ],
        },
      }))

      // Combine defaults with Supabase courses, excluding removed
      return [...customCourses, ...COURSES].filter((c) => !removedIds.includes(c.id))
    }
  } catch (err) {
    console.error("Error reading from Supabase:", err)
  }

  return getLocalCourses().filter((c) => !removedIds.includes(c.id))
}

// Add a course / file to Supabase
export async function addCourseRecord(
  name: string,
  googleDriveUrl: string,
  size: string = "4.18 GB"
): Promise<{ success: boolean; error?: string }> {
  const id = `course-${Date.now()}`
  const newRecord = {
    id,
    name: name.trim(),
    google_drive_url: googleDriveUrl.trim(),
    size: size.trim(),
    size_bytes: parseFloat(size) ? parseFloat(size) * 1024 * 1024 * 1024 : 4.18 * 1024 * 1024 * 1024,
    created_at: new Date().toISOString(),
  }

  // 1. Save to local storage as instant reliable cache
  saveLocalCourse(newRecord)

  // 2. Insert into Supabase
  try {
    const { error } = await supabase.from("courses").insert([newRecord])
    if (error) {
      console.warn("Supabase insert note:", error.message)
      return { success: true, error: error.message }
    }
    return { success: true }
  } catch (err: any) {
    return { success: true, error: err?.message }
  }
}

// Record user login into Supabase
export async function recordUserLogin(
  email?: string,
  username?: string
): Promise<void> {
  if (!email || !username) return

  const safeEmail = String(email || "").trim()
  const safeUsername = String(username || "").trim()
  if (!safeEmail || !safeUsername) return

  const isMobile =
    typeof navigator !== "undefined" && navigator.userAgent
      ? navigator.userAgent.includes("Mobile")
      : false

  const record: UserLoginRecord = {
    id: `login-${Date.now()}`,
    email: safeEmail,
    username: safeUsername,
    device: isMobile ? "Mobile Phone" : "Desktop PC",
    logged_in_at: new Date().toISOString(),
  }

  // Always save locally
  saveLocalLogin(record)

  // Attempt save to Supabase
  try {
    const { error } = await supabase.from("user_logins").insert([record])
    if (error) {
      console.warn("Supabase user_logins insert note:", error.message)
    }
  } catch (err) {
    console.warn("Could not record login to Supabase:", err)
  }
}

// Get all login records
export async function getUserLoginsList(): Promise<UserLoginRecord[]> {
  try {
    const { data, error } = await supabase
      .from("user_logins")
      .select("*")
      .order("logged_in_at", { ascending: false })

    if (error) {
      return getLocalLogins()
    }

    if (data && data.length > 0) {
      return data as UserLoginRecord[]
    }
  } catch (err) {
    console.warn(err)
  }

  return getLocalLogins()
}

// Local cache helpers
function getLocalCourses(): Course[] {
  const removedIds = getRemovedCourseIds()
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_COURSES_KEY)
    if (!saved) return COURSES.filter((c) => !removedIds.includes(c.id))
    const parsed = JSON.parse(saved)
    const customCourses: Course[] = parsed.map((item: any) => ({
      id: item.id,
      name: item.name,
      tagline: "Custom course bundle added via FileDrive Admin",
      size: item.size || "4.18 GB",
      sizeBytes: item.size_bytes || 4.18 * 1024 * 1024 * 1024,
      lastModified: "Recently added",
      access: "Only you",
      starred: true,
      googleDriveUrl: item.google_drive_url,
      rootNode: {
        name: item.name,
        nodes: [
          { name: "Course_Archive.zip", size: item.size || "4.18 GB" },
          { name: "Google_Drive_Mirror.txt", size: "1 KB" },
        ],
      },
    }))
    return [...customCourses, ...COURSES].filter((c) => !removedIds.includes(c.id))
  } catch {
    return COURSES.filter((c) => !removedIds.includes(c.id))
  }
}

function saveLocalCourse(item: any) {
  try {
    const current = JSON.parse(localStorage.getItem(LOCAL_STORAGE_COURSES_KEY) || "[]")
    localStorage.setItem(LOCAL_STORAGE_COURSES_KEY, JSON.stringify([item, ...current]))
  } catch (err) {
    console.error(err)
  }
}

function getLocalLogins(): UserLoginRecord[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_LOGINS_KEY) || "[]")
  } catch {
    return []
  }
}

function saveLocalLogin(record: UserLoginRecord) {
  try {
    const current = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LOGINS_KEY) || "[]")
    localStorage.setItem(LOCAL_STORAGE_LOGINS_KEY, JSON.stringify([record, ...current].slice(0, 100)))
  } catch (err) {
    console.error(err)
  }
}

// -------------------------------------------------------------
// SUBSCRIPTIONS
// -------------------------------------------------------------

export async function recordUserSubscription(subData: any): Promise<void> {
  if (!subData || !subData.userEmail) return

  try {
    const { error } = await supabase.from("user_subscriptions").upsert([{
      id: subData.id,
      email: subData.userEmail,
      provider: subData.provider,
      plan_name: subData.planName,
      billing_cycle: subData.billingCycle,
      status: subData.status,
      created_at: subData.startDate,
      current_period_end: subData.currentPeriodEnd
    }], { onConflict: 'email' }) // Assuming one active sub per email
    
    if (error) {
      console.warn("Supabase user_subscriptions upsert note:", error.message)
    }
  } catch (err) {
    console.warn("Could not record subscription to Supabase:", err)
  }
}

export async function fetchUserSubscription(email: string): Promise<any | null> {
  if (!email) return null

  try {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("email", email)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)

    if (error || !data || data.length === 0) {
      return null
    }

    const row = data[0]
    return {
      id: row.id,
      userEmail: row.email,
      provider: row.provider,
      planName: row.plan_name,
      billingCycle: row.billing_cycle,
      status: row.status,
      startDate: row.created_at,
      currentPeriodEnd: row.current_period_end
    }
  } catch (err) {
    console.warn("Could not fetch subscription from Supabase:", err)
    return null
  }
}
