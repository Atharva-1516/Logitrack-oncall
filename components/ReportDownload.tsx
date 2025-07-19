'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Job } from '@/lib/types'
import * as XLSX from 'xlsx'

export default function ReportDownload() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    // Set default date range to current month
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(lastDay.toISOString().split('T')[0])
  }, [])

  const fetchJobsForReport = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          site:sites(name)
        `)
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`)
        .order('created_at', { ascending: true })

      if (error) throw error
      setJobs(data || [])
    } catch (error) {
      console.error('Error fetching jobs for report:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateExcelReport = () => {
    if (jobs.length === 0) {
      alert('No jobs found for the selected date range.')
      return
    }

    // Prepare data for Excel
    const excelData = jobs.map(job => ({
      'Date': formatDate(new Date(job.created_at)),
      'Start Time': job.start_time ? new Date(job.start_time).toLocaleTimeString() : '',
      'End Time': job.end_time ? new Date(job.end_time).toLocaleTimeString() : '',
      'Site Name': job.site?.name || 'Unknown Site',
      'Work Hours': job.travel_time ? job.travel_time.toFixed(2) : '',
      'Travel Distance (km)': job.travel_km ? job.travel_km.toFixed(1) : '',
      'Fuel Cost ($)': job.fuel_cost ? job.fuel_cost.toFixed(2) : '',
      'Work Summary': job.work_summary || ''
    }))

    // Calculate totals
    const totalHours = jobs.reduce((sum, job) => sum + (job.travel_time || 0), 0)
    const totalDistance = jobs.reduce((sum, job) => sum + (job.travel_km || 0), 0)
    const totalFuelCost = jobs.reduce((sum, job) => sum + (job.fuel_cost || 0), 0)

    // Add summary row
    excelData.push({
      'Date': 'TOTALS',
      'Start Time': '',
      'End Time': '',
      'Site Name': '',
      'Work Hours': totalHours.toFixed(2),
      'Travel Distance (km)': totalDistance.toFixed(1),
      'Fuel Cost ($)': totalFuelCost.toFixed(2),
      'Work Summary': ''
    })

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    const colWidths = [
      { wch: 12 }, // Date
      { wch: 10 }, // Start Time
      { wch: 10 }, // End Time
      { wch: 20 }, // Site Name
      { wch: 12 }, // Work Hours
      { wch: 18 }, // Travel Distance
      { wch: 12 }, // Fuel Cost
      { wch: 40 }  // Work Summary
    ]
    ws['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Job Report')

    // Generate filename
    const startDateFormatted = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endDateFormatted = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const filename = `LogiTrack_Report_${startDateFormatted}_to_${endDateFormatted}.xlsx`

    // Download file
    XLSX.writeFile(wb, filename)
  }

  const generateBiMonthlyReport = () => {
    const now = new Date()
    const currentDay = now.getDate()
    
    let reportStartDate: Date
    let reportEndDate: Date

    if (currentDay <= 15) {
      // First half of month (1st to 15th)
      reportStartDate = new Date(now.getFullYear(), now.getMonth(), 1)
      reportEndDate = new Date(now.getFullYear(), now.getMonth(), 15)
    } else {
      // Second half of month (16th to end)
      reportStartDate = new Date(now.getFullYear(), now.getMonth(), 16)
      reportEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    }

    setStartDate(reportStartDate.toISOString().split('T')[0])
    setEndDate(reportEndDate.toISOString().split('T')[0])
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Generate Report</h2>

      <div className="space-y-6">
        {/* Date Range Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <button
            onClick={generateBiMonthlyReport}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Set Bi-Monthly Range
          </button>
          <button
            onClick={fetchJobsForReport}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load Jobs'}
          </button>
        </div>

        {/* Job Count */}
        {jobs.length > 0 && (
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-green-800">
              Found {jobs.length} jobs for the selected date range.
            </p>
          </div>
        )}

        {/* Generate Report Button */}
        <button
          onClick={generateExcelReport}
          disabled={jobs.length === 0 || loading}
          className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
        >
          Generate Excel Report
        </button>

        {/* Report Preview */}
        {jobs.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Report Preview</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total Hours:</span>
                  <span className="ml-2">
                    {jobs.reduce((sum, job) => sum + (job.travel_time || 0), 0).toFixed(2)}h
                  </span>
                </div>
                <div>
                  <span className="font-medium">Total Distance:</span>
                  <span className="ml-2">
                    {jobs.reduce((sum, job) => sum + (job.travel_km || 0), 0).toFixed(1)}km
                  </span>
                </div>
                <div>
                  <span className="font-medium">Total Fuel Cost:</span>
                  <span className="ml-2">
                    ${jobs.reduce((sum, job) => sum + (job.fuel_cost || 0), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 