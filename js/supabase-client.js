const SUPABASE_URL = 'https://khvbciywajadppmrvxxi.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtodmJjaXl3YWphZHBwbXJ2eHhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNzUwMjgsImV4cCI6MjA3MDg1MTAyOH0.bNbQt-z4_3FvuFfSw0Pvj2DGu9Lf6HeB8BZU_VkvgkY';

// Create a single supabase client for interacting with your database
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);