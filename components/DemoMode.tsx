'use client'

import { useState } from 'react'
import { formatTime, formatDate, calculateDistance, calculateFuelCost } from '@/lib/utils'

interface DemoJob {
  id: string
  start_time: string
  end_time: string | null
  site_name: string
  travel_km: number | null
  travel_time: number | null
  fuel_cost: number | null
  work_summary: string | null
  created_at: string
}

export default function DemoMode() {
  const [isJobActive, setIsJobActive] = useState(false)
  const [currentJob, setCurrentJob] = useState<DemoJob | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [siteName, setSiteName] = useState('')
  const [workSummary, setWorkSummary] = useState('')
  const [fuelEfficiency, setFuelEfficiency] = useState(12)
  const [fuelPrice, setFuelPrice] = useState(1.5)
  const [jobs, setJobs] = useState<DemoJob[]>([])
  const [message, setMessage] = useState('')

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setMessage('Location obtained successfully!')
        },
        (error) => {
          console.error('Error getting location:', error)
          setMessage('Error getting location. Please enable location access.')
        }
      )
    }
  }

  const startJob = () => {
    if (!currentLocation) {
      setMessage('Please enable location access to start a job.')
      return
    }

    const newJob: DemoJob = {
      id: Date.now().toString(),
      start_time: new Date().toISOString(),
      end_time: null,
      site_name: siteName || 'Unknown Site',
      travel_km: null,
      travel_time: null,
      fuel_cost: null,
      work_summary: null,
      created_at: new Date().toISOString()
    }

    setCurrentJob(newJob)
    setIsJobActive(true)
    setMessage('Job started successfully!')
  }

  const endJob = () => {
    if (!currentJob) return

    const endTime = new Date()
    const startTime = new Date(currentJob.start_time)
    const workHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
    
    // Simulate travel distance (you can enhance this with real calculations)
    const travelKm = Math.random() * 50 + 10 // Random distance between 10-60 km
    const fuelCost = calculateFuelCost(travelKm, fuelEfficiency, fuelPrice)

    const completedJob: DemoJob = {
      ...currentJob,
      end_time: endTime.toISOString(),
      travel_km: travelKm,
      travel_time: workHours,
      fuel_cost: fuelCost,
      work_summary: workSummary,
      site_name: siteName || currentJob.site_name
    }

    setJobs([completedJob, ...jobs])
    setIsJobActive(false)
    setCurrentJob(null)
    setSiteName('')
    setWorkSummary('')
    setMessage('Job ended successfully!')
  }

  const deleteJob = (jobId: string) => {
    setJobs(jobs.filter(job => job.id !== jobId))
  }

  const getTotalHours = () => {
    return jobs.reduce((total, job) => total + (job.travel_time || 0), 0)
  }

  const getTotalDistance = () => {
    return jobs.reduce((total, job) => total + (job.travel_km || 0), 0)
  }

  const getTotalFuelCost = () => {
    return jobs.reduce((total, job) => total + (job.fuel_cost || 0), 0)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">Demo Mode</h2>
        <p className="text-yellow-700 text-sm">
          This is a demo version that works without Supabase. Your data will be stored locally and will be lost when you refresh the page.
        </p>
      </div>

      {/* Job Tracker */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Job Tracker</h2>

        {message && (
          <div className={`mb-4 p-3 rounded ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          {/* Location Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Location Status</h3>
            {currentLocation ? (
              <p className="text-sm text-gray-600">
                Current Location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
            ) : (
              <div>
                <p className="text-sm text-red-600 mb-2">Location not available</p>
                <button
                  onClick={getCurrentLocation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Get Location
                </button>
              </div>
            )}
          </div>

          {/* Job Controls */}
          <div className="flex gap-4">
            {!isJobActive ? (
              <button
                onClick={startJob}
                disabled={!currentLocation}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Start Job
              </button>
            ) : (
              <button
                onClick={endJob}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700"
              >
                End Job
              </button>
            )}
          </div>

          {/* Job Details */}
          {isJobActive && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Site Name</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Enter site name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Fuel Efficiency (km/L)</label>
                  <input
                    type="number"
                    value={fuelEfficiency}
                    onChange={(e) => setFuelEfficiency(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Fuel Price ($/L)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Work Summary</label>
                <textarea
                  value={workSummary}
                  onChange={(e) => setWorkSummary(e.target.value)}
                  placeholder="Describe what you did on-site..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Current Job Status */}
          {isJobActive && currentJob && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold mb-2">Current Job</h3>
              <p className="text-sm text-gray-600">
                Started: {formatTime(new Date(currentJob.start_time))}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Job History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Job History</h2>

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
        {jobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No jobs completed yet. Start your first job above!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{formatDate(new Date(job.created_at))}</div>
                        <div className="text-gray-500">
                          {formatTime(new Date(job.start_time))}
                          {job.end_time && ` - ${formatTime(new Date(job.end_time))}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.site_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.travel_time ? `${job.travel_time.toFixed(2)}h` : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.travel_km ? `${job.travel_km.toFixed(1)}km` : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.fuel_cost ? `$${job.fuel_cost.toFixed(2)}` : '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate">{job.work_summary || '-'}</div>
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