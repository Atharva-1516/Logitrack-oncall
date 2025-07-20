import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || !supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key_here') {
  console.warn('Missing or invalid Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file')
}

// Create Supabase client with fallback for development
export const supabase = createClient(
  supabaseUrl || 'https://ejvcrwsykvzcherajieq.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdmNyd3N5a3ZoY2hlcmFqaWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTc2NjMsImV4cCI6MjA2ODUzMzY2M30.WSh5vmq-x7IsBf3M1hp0coPXUAzaZp_2EwBoihcuYN4'
) 