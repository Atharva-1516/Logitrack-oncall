#!/bin/bash

echo "Setting environment variables for Vercel deployment..."

# Set Supabase URL
echo "Setting NEXT_PUBLIC_SUPABASE_URL..."
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://ejvcrwsykvzcherajieq.supabase.co"

# Set Supabase Anon Key
echo "Setting NEXT_PUBLIC_SUPABASE_ANON_KEY..."
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdmNyd3N5a3ZoY2hlcmFqaWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTc2NjMsImV4cCI6MjA2ODUzMzY2M30.WSh5vmq-x7IsBf3M1hp0coPXUAzaZp_2EwBoihcuYN4"

# Set Google Maps API Key
echo "Setting NEXT_PUBLIC_GOOGLE_MAPS_API_KEY..."
npx vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY production <<< "AIzaSyCxD0H-Ls5CfeSwCv0h22HcX8XazK21qsg"

echo "Environment variables set successfully!"
echo "Redeploying the application..."
npx vercel --prod 