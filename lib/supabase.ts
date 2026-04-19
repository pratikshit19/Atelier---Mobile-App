import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://clobpufnxdhasroiroyf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsb2JwdWZueGRoYXNyb2lyb3lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODUyMjYsImV4cCI6MjA5MjE2MTIyNn0.OHLPJTDbiacJpWMRMSxHBQgygjUnwHIVrQXEMpOC8ZI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
