import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://sfgsgcpzesjinkdlsrkw.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZ3NnY3B6ZXNqaW5rZGxzcmt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NzY4NjAsImV4cCI6MjA4OTM1Mjg2MH0.7B-lTuMVoU5zMEM3jtzEw6j32JzSI3VfCOtOoD7Hj9Q';

export const supabase = createClient(supabaseUrl, supabaseKey);
