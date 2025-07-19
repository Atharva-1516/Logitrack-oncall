# LogiTrack OnCall - Technician Visit Tracker

A personal web application for tracking on-call technician visits, work hours, travel distance, and fuel costs. Built with Next.js, Supabase, and Tailwind CSS.

## Features

- **Location Detection**: Automatically detect user location and recognize nearby sites
- **Job Tracking**: Start/stop job timers with automatic work hour calculation
- **Site Management**: Auto-save new locations or manually name them
- **Fuel Cost Calculation**: Calculate fuel costs based on distance, efficiency, and current fuel prices
- **Work Summary**: Add detailed descriptions of work performed
- **Job History**: View all completed jobs with filtering options
- **Excel Reports**: Generate downloadable Excel reports for bi-monthly periods
- **Mobile-Friendly**: Responsive design that works on all devices
- **Simple Authentication**: Username/password login for single user

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Maps**: Google Maps API
- **Excel Export**: SheetJS (xlsx)
- **Deployment**: Vercel (recommended)

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account
- Google Cloud Console account (for Maps API)

### 2. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd logitrack-oncall

# Install dependencies
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 4. Supabase Setup

1. Create a new Supabase project
2. Run the following SQL in the Supabase SQL editor:

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
  user_id UUID REFERENCES auth.users(id),
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

-- Create policies (adjust user_id to your actual user ID)
CREATE POLICY "Users can view their own jobs" ON jobs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view all sites" ON sites
  FOR ALL USING (true);
```

3. Enable Email/Password authentication in Supabase Auth settings
4. Create your user account in the Supabase Auth dashboard

### 5. Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Distance Matrix API
4. Create credentials (API key)
5. Restrict the API key to your domain for security

### 6. Run the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Usage

### 1. Authentication
- Log in with your email and password
- The app will remember your session

### 2. Job Tracking
- Click "Start Job" to begin tracking
- Allow location access when prompted
- The app will detect if you're near a known site
- If it's a new location, you can name it
- Add fuel efficiency and current fuel price
- Click "End Job" when finished
- Add a work summary

### 3. Viewing History
- Navigate to "Job History" tab
- Filter by time period (today, week, month, all time)
- View summary statistics
- Delete jobs if needed

### 4. Generating Reports
- Go to "Reports" tab
- Select date range or use "Set Bi-Monthly Range"
- Click "Load Jobs" to fetch data
- Click "Generate Excel Report" to download

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to add these in your hosting platform:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Customization

### Fuel Price API Integration

To integrate with a real-time fuel price API, modify the `JobForm.tsx` component:

```typescript
// Add this function to fetch fuel prices
const fetchFuelPrice = async () => {
  try {
    const response = await fetch('your_fuel_api_endpoint')
    const data = await response.json()
    setFuelPrice(data.price)
  } catch (error) {
    console.error('Error fetching fuel price:', error)
  }
}
```

### Home Location

To improve travel distance calculations, you can add your home location coordinates in the `JobForm.tsx` component.

## Troubleshooting

### Location Not Working
- Ensure HTTPS is enabled (required for geolocation)
- Check browser permissions for location access
- Try refreshing the page

### Database Errors
- Verify Supabase connection in `.env.local`
- Check that tables are created correctly
- Ensure RLS policies are set up properly

### Google Maps API Issues
- Verify API key is correct
- Check that required APIs are enabled
- Ensure API key restrictions allow your domain

## License

This project is for personal use. Feel free to modify and adapt for your needs.

## Support

For issues or questions, check the troubleshooting section above or review the Supabase and Google Maps API documentation.
