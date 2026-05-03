import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dyokmmaqstnfkxecrgzj.supabase.co";
const supabaseAnonKey = "sb_publishable_7Pjt-2edJgefWwlOFS401A_kT7yZkJT";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
