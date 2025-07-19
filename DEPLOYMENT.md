# LogiTrack OnCall - Deployment Guide

Your LogiTrack OnCall application is ready for deployment! Here are several hosting options:

## 🚀 Option 1: Vercel (Recommended)

### Automatic Deployment:
1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/logitrack-oncall.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://ejvcrwsykvzcherajieq.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdmNyd3N5a3ZoY2hlcmFqaWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTc2NjMsImV4cCI6MjA2ODUzMzY2M30.WSh5vmq-x7IsBf3M1hp0coPXUAzaZp_2EwBoihcuYN4
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCxD0H-Ls5CfeSwCv0h22HcX8XazK21qsg
     ```
   - Click "Deploy"

## 🌐 Option 2: Netlify

1. **Push to GitHub** (same as above)
2. **Deploy on Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login with GitHub
   - Click "New site from Git"
   - Choose your repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Add environment variables (same as Vercel)
   - Click "Deploy site"

## ☁️ Option 3: Railway

1. **Push to GitHub** (same as above)
2. **Deploy on Railway:**
   - Go to [railway.app](https://railway.app)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository
   - Add environment variables
   - Deploy

## 📱 Option 4: Render

1. **Push to GitHub** (same as above)
2. **Deploy on Render:**
   - Go to [render.com](https://render.com)
   - Sign up/Login with GitHub
   - Click "New Web Service"
   - Connect your repository
   - Build command: `npm run build`
   - Start command: `npm start`
   - Add environment variables
   - Deploy

## 🔧 Environment Variables Required

Make sure to add these environment variables in your hosting platform:

```
NEXT_PUBLIC_SUPABASE_URL=https://ejvcrwsykvzcherajieq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdmNyd3N5a3ZoY2hlcmFqaWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTc2NjMsImV4cCI6MjA2ODUzMzY2M30.WSh5vmq-x7IsBf3M1hp0coPXUAzaZp_2EwBoihcuYN4
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCxD0H-Ls5CfeSwCv0h22HcX8XazK21qsg
```

## 🗄️ Database Setup

Before deploying, make sure your Supabase database tables are created:

1. Go to [supabase.com/dashboard/project/ejvcrwsykvzcherajieq](https://supabase.com/dashboard/project/ejvcrwsykvzcherajieq)
2. Click "SQL Editor"
3. Run this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sites table
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  first_visited TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES sites(id),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  travel_km DOUBLE PRECISION,
  travel_time DOUBLE PRECISION,
  fuel_cost DOUBLE PRECISION,
  work_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on sites" ON sites FOR ALL USING (true);
CREATE POLICY "Allow all operations on jobs" ON jobs FOR ALL USING (true);
```

## ✅ After Deployment

Your app will be available at a public URL like:
- Vercel: `https://your-app-name.vercel.app`
- Netlify: `https://your-app-name.netlify.app`
- Railway: `https://your-app-name.railway.app`
- Render: `https://your-app-name.onrender.com`

## 🎉 Features Available

- ✅ Job tracking with location detection
- ✅ Site management with automatic recognition
- ✅ Fuel cost calculations
- ✅ Excel report generation
- ✅ Mobile-responsive design
- ✅ Data persistence in Supabase 