import { createClient } from '@supabase/supabase-js'

// Type assertion since env vars may be undefined
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)
