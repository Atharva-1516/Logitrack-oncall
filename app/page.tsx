'use client'

import { useState, useEffect } from 'react'
import JobForm from '@/components/JobForm'
import JobList from '@/components/JobList'
import ReportDownload from '@/components/ReportDownload'
import Navigation from '@/components/Navigation'

export default function Home() {
  const [activeTab, setActiveTab] = useState('tracker')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto py-8">
        {activeTab === 'tracker' && <JobForm />}
        {activeTab === 'history' && <JobList />}
        {activeTab === 'reports' && <ReportDownload />}
      </main>
    </div>
  )
}
