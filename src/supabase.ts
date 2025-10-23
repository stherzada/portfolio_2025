import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY

if (!supabaseUrl || supabaseUrl.trim() === '') {
  throw new Error('SUPABASE_URL is required but not defined or empty')
}

if (!supabaseAnonKey || supabaseAnonKey.trim() === '') {
  throw new Error('SUPABASE_ANON_KEY is required but not defined or empty')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;