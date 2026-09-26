import { createClient } from "@supabase/supabase-js"

export const SUPABASE_URL = "https://jjljunwwckeqvifedcne.supabase.co"
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqbGp1bnd3Y2tlcXZpZmVkY25lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NDAyNzcsImV4cCI6MjEwNjAxNjI3N30.uxrceArocJlqZ1PKRtAB6KzXQuLI4dmH7wFa4bPDLw0"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
