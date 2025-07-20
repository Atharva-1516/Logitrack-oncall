'use client'

import { useState } from 'react'
import JobForm from '@/components/JobForm'
import JobList from '@/components/JobList'
import ReportDownload from '@/components/ReportDownload'
import Navigation from '@/components/Navigation'

export default function Home() {
  const [activeTab, setActiveTab] = useState('tracker')

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
