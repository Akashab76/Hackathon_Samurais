import { createClient } from "@supabase/supabase-js"

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://zsfdqctzqigfdomichnf.supabase.co"

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_baE_iaEI1nU0hzmrk1w1QQ_0YkpJivH"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
