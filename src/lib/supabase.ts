import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxsxujfvwdljvkvmblck.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4c3h1amZ2d2RsanZrdm1ibGNrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODkyMzQzOSwiZXhwIjoyMDU0NDk5NDM5fQ.ZdIhG9QbYAsILXp4n0iLlJJCvTgauwzsxS6-P0p5mT0';
export const supabase = createClient(supabaseUrl, supabaseKey);


