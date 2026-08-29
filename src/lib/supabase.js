import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, USE_SUPABASE } from '@/config'

// anon/publishable key 本就设计为公开，可安全放在前端
export const supabase =
  USE_SUPABASE && SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null
