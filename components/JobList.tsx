'use client'

import { useState, useEffect } from 'react'
import { Job, Site } from '@/lib/types'
import { formatTime, calculateWorkHours } from '@/lib/utils'

export default function JobList() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, today, week, month

  useEffect(() => {
    fetchJobs()
  }, [filter])

  const fetchJobs = () => {
    setLoading(true)
    try {
      // Get jobs from local storage
      const savedJobs = localStorage.getItem('logitrack-jobs')
      const allJobs: Job[] = savedJobs ? JSON.parse(savedJobs) : []
      
      // Apply date filters
      const now = new Date()
      let filteredJobs = allJobs

      if (filter === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        filteredJobs = allJobs.filter(job => 
          new Date(job.created_at) >= today
        )
      } else if (filter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        filteredJobs = allJobs.filter(job => 
          new Date(job.created_at) >= weekAgo
        )
      } else if (filter === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        filteredJobs = allJobs.filter(job => 
          new Date(job.created_at) >= monthAgo
        )
      }

      // Sort by created_at descending
      filteredJobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
      setJobs(filteredJobs)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteJob = (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return

    try {
      const updatedJobs = jobs.filter(job => job.id !== jobId)
      setJobs(updatedJobs)
      localStorage.setItem('logitrack-jobs', JSON.stringify(updatedJobs))
    } catch (error) {
      console.error('Error deleting job:', error)
    }
  }

  const getTotalHours = () => {
    return jobs.reduce((total, job) => {
      if (job.travel_time) {
        return total + job.travel_time
      }
      return total
    }, 0)
  }

  const getTotalDistance = () => {
    return jobs.reduce((total, job) => {
      if (job.travel_km) {
        return total + job.travel_km
      }
      return total
    }, 0)
  }

  const getTotalFuelCost = () => {
    return jobs.reduce((total, job) => {
      if (job.fuel_cost) {
        return total + job.fuel_cost
      }
      return total
    }, 0)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">Loading jobs...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Job History</h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Total Hours</h3>
          <p className="text-2xl font-bold text-blue-600">{getTotalHours().toFixed(2)}h</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Total Distance</h3>
          <p className="text-2xl font-bold text-green-600">{getTotalDistance().toFixed(1)}km</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Total Fuel Cost</h3>
          <p className="text-2xl font-bold text-yellow-600">${getTotalFuelCost().toFixed(2)}</p>
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {jobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No jobs found for the selected period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fuel Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Summary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{formatDate(new Date(job.created_at))}</div>
                        <div className="text-gray-500">
                          {job.start_time && formatTime(new Date(job.start_time))}
                          {job.end_time && ` - ${formatTime(new Date(job.end_time))}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {job.site?.name || 'Unknown Site'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {job.travel_time ? `${job.travel_time.toFixed(2)}h` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {job.travel_km ? `${job.travel_km.toFixed(1)}km` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {job.fuel_cost ? `$${job.fuel_cost.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate">
                        {job.work_summary || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => deleteJob(job.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 