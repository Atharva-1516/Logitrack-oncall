'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import JobForm from '@/components/JobForm'
import JobList from '@/components/JobList'
import ReportDownload from '@/components/ReportDownload'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tracker')

  useEffect(() => {
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase not configured')
      setLoading(false)
      return
    }

    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'tracker':
        return <JobForm />
      case 'history':
        return <JobList />
      case 'reports':
        return <ReportDownload />
      default:
        return <JobForm />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="py-8">
        {renderContent()}
      </main>
    </div>
  )
}
