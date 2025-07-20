'use client'

import { useState } from 'react'
import { Job } from '@/lib/types'
import * as XLSX from 'xlsx'

export default function ReportDownload() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchJobsForReport = () => {
    setLoading(true)
    try {
      // Get jobs from local storage
      const savedJobs = localStorage.getItem('logitrack-jobs')
      const allJobs: Job[] = savedJobs ? JSON.parse(savedJobs) : []
      
      // Filter jobs by date range
      const filteredJobs = allJobs.filter(job => {
        const jobDate = new Date(job.created_at)
        const start = startDate ? new Date(startDate) : new Date(0)
        const end = endDate ? new Date(endDate + 'T23:59:59') : new Date()
        
        return jobDate >= start && jobDate <= end
      })
      
      setJobs(filteredJobs)
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

    // Helper function to get day abbreviation
    const getDayAbbreviation = (date: Date) => {
      const days = ['SUN', 'MON', 'TUE', 'WED', 'THR', 'FRI', 'SAT']
      return days[date.getDay()]
    }

    // Helper function to format date like "JUL 9TH"
    const formatDateLikeTemplate = (date: Date) => {
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
      const month = months[date.getMonth()]
      const day = date.getDate()
      const suffix = day === 1 ? 'ST' : day === 2 ? 'ND' : day === 3 ? 'RD' : 'TH'
      return `${month} ${day}${suffix}`
    }

    // Helper function to format time like "10:55 AM"
    const formatTimeLikeTemplate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    }

    // Group jobs by date
    const jobsByDate = jobs.reduce((acc, job) => {
      const date = new Date(job.created_at).toDateString()
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(job)
      return acc
    }, {} as Record<string, Job[]>)

    // Prepare data for Excel matching the template format
    const excelData: {
      Day: string
      Date: string
      'Time Start': string
      'Time End': string
      Hours: string
      Customer: string
      'Work Order': string
      'Work Hours': string
      'Train Hours': string
      'Other Hours': string
      Notes: string
    }[] = []
    
    // Add header row
    excelData.push({
      'Day': 'Day',
      'Date': 'Date',
      'Time Start': 'Time Start',
      'Time End': 'Time End',
      'Hours': 'Hours',
      'Customer': 'Customer',
      'Work Order': 'Work Order',
      'Work Hours': 'Work Hours',
      'Train Hours': 'Train Hours',
      'Other Hours': 'Other Hours',
      'Notes': 'Notes'
    })

    // Add job data rows
    Object.entries(jobsByDate).forEach(([dateString, dayJobs]) => {
      const date = new Date(dateString)
      const dayAbbr = getDayAbbreviation(date)
      const dateFormatted = formatDateLikeTemplate(date)
      
      dayJobs.forEach((job, index) => {
        const startTime = job.start_time ? formatTimeLikeTemplate(job.start_time) : ''
        const endTime = job.end_time ? formatTimeLikeTemplate(job.end_time) : ''
        const hours = job.travel_time ? job.travel_time.toFixed(2) : ''
        const workHours = job.travel_time ? job.travel_time.toFixed(2) : ''
        
        excelData.push({
          'Day': index === 0 ? dayAbbr : '', // Only show day for first job of the day
          'Date': index === 0 ? dateFormatted : '', // Only show date for first job of the day
          'Time Start': startTime,
          'Time End': endTime,
          'Hours': hours,
          'Customer': job.site?.name || 'Unknown Site',
          'Work Order': job.site_id || '',
          'Work Hours': workHours,
          'Train Hours': '0.00',
          'Other Hours': '0.00',
          'Notes': job.work_summary || ''
        })
      })
    })

    // Calculate totals
    const totalHours = jobs.reduce((sum, job) => sum + (job.travel_time || 0), 0)
    const totalWorkHours = totalHours
    const totalTrainHours = 0
    const totalOtherHours = 0

    // Add totals row
    excelData.push({
      'Day': '',
      'Date': 'Totals',
      'Time Start': '',
      'Time End': '',
      'Hours': totalHours.toFixed(2),
      'Customer': '',
      'Work Order': '',
      'Work Hours': totalWorkHours.toFixed(2),
      'Train Hours': totalTrainHours.toFixed(2),
      'Other Hours': totalOtherHours.toFixed(2),
      'Notes': ''
    })

    // Add summary row
    excelData.push({
      'Day': '',
      'Date': '',
      'Time Start': '',
      'Time End': '',
      'Hours': '',
      'Customer': 'Summary',
      'Work Order': totalHours.toFixed(2),
      'Work Hours': totalWorkHours.toFixed(2),
      'Train Hours': totalTrainHours.toFixed(2),
      'Other Hours': totalOtherHours.toFixed(2),
      'Notes': totalHours.toFixed(2)
    })

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(excelData)

    // Set column widths to match template
    const colWidths = [
      { wch: 8 },  // Day
      { wch: 12 }, // Date
      { wch: 12 }, // Time Start
      { wch: 12 }, // Time End
      { wch: 8 },  // Hours
      { wch: 15 }, // Customer
      { wch: 15 }, // Work Order
      { wch: 12 }, // Work Hours
      { wch: 12 }, // Train Hours
      { wch: 12 }, // Other Hours
      { wch: 50 }  // Notes
    ]
    ws['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Timesheet')

    // Generate filename matching template format
    const startDateFormatted = new Date(startDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    const endDateFormatted = new Date(endDate).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    })
    const filename = `${startDateFormatted} to ${endDateFormatted}.xlsx`

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
                  <span className="font-medium">Total Work Hours:</span>
                  <span className="ml-2">
                    {jobs.reduce((sum, job) => sum + (job.travel_time || 0), 0).toFixed(2)}h
                  </span>
                </div>
                <div>
                  <span className="font-medium">Total Train Hours:</span>
                  <span className="ml-2">0.00h</span>
                </div>
                <div>
                  <span className="font-medium">Total Other Hours:</span>
                  <span className="ml-2">0.00h</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 