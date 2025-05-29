import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// Supabase client initialization
// The URL and anon key will need to be replaced with actual values after connecting to Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single instance of the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);