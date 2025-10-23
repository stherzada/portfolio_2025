import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || supabaseUrl.trim() === '') {
  throw new Error('VITE_SUPABASE_URL is required but not defined or empty')
}

if (!supabaseAnonKey || supabaseAnonKey.trim() === '') {
  throw new Error('VITE_SUPABASE_ANON_KEY is required but not defined or empty')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;