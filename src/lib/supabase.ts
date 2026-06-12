import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://posajcqpwnzhdxhqvbic.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_DTpPHzHdk4U7-vqFde2-hg_LwA6VXqf';

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey);
