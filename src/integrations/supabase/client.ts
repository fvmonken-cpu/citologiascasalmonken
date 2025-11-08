import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://pzddfexyonmlvqdazgms.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6ZGRmZXh5b25tbHZxZGF6Z21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMTQxNDIsImV4cCI6MjA3NzY5MDE0Mn0.maUv1X-vq9spxtWelZ2OoVRQpmPQ9QibZooUHzyeCs4"

// Create client with proper configuration for the medical system
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})