'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { calculateDistance, calculateFuelCost, formatTime, calculateWorkHours } from '@/lib/utils'
import { Site, Job } from '@/lib/types'

export default function JobForm() {
  const [isJobActive, setIsJobActive] = useState(false)
  const [currentJob, setCurrentJob] = useState<Job | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [nearbySites, setNearbySites] = useState<Site[]>([])
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [newSiteName, setNewSiteName] = useState('')
  const [workSummary, setWorkSummary] = useState('')
  const [fuelEfficiency, setFuelEfficiency] = useState(12)
  const [fuelPrice, setFuelPrice] = useState(1.5)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [useLocalStorage, setUseLocalStorage] = useState(false)
  const [localJobs, setLocalJobs] = useState<Job[]>([])
  const [localSites, setLocalSites] = useState<Site[]>([])

  useEffect(() => {
    getCurrentLocation()
    testSupabaseConnection()
    fetchSites()
    
    // Load local data if available
    const savedJobs = localStorage.getItem('logitrack-jobs')
    const savedSites = localStorage.getItem('logitrack-sites')
    if (savedJobs) setLocalJobs(JSON.parse(savedJobs))
    if (savedSites) setLocalSites(JSON.parse(savedSites))
  }, [])

  const testSupabaseConnection = async () => {
    try {
      console.log('Testing Supabase connection...')
      const { data, error } = await supabase
        .from('sites')
        .select('count')
        .limit(1)
      
      if (error) {
        console.error('Supabase connection test failed:', error)
        setMessage(`Database connection failed: ${error.message}`)
        setUseLocalStorage(true) // Fallback to local storage
      } else {
        console.log('Supabase connection successful')
      }
    } catch (error) {
      console.error('Supabase connection test error:', error)
      setMessage(`Network error: ${error instanceof Error ? error.message : 'Failed to connect to database'}`)
      setUseLocalStorage(true) // Fallback to local storage
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          setMessage('Error getting location. Please enable location access.')
        }
      )
    }
  }

  const fetchSites = async () => {
    try {
      console.log('Fetching sites from Supabase...')
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('first_visited', { ascending: false })

      if (error) {
        console.error('Error fetching sites:', error)
        setMessage(`Error fetching sites: ${error.message}`)
        // Use local storage as fallback
        setNearbySites(localSites)
        setUseLocalStorage(true)
      } else {
        console.log('Sites fetched successfully:', data)
        setNearbySites(data || [])
      }
    } catch (error) {
      console.error('Error fetching sites:', error)
      setMessage(`Error fetching sites: ${error instanceof Error ? error.message : 'Unknown error'}`)
      // Use local storage as fallback
      setNearbySites(localSites)
      setUseLocalStorage(true)
    }
  }

  const checkNearbySites = (lat: number, lng: number) => {
    const allSites = useLocalStorage ? localSites : nearbySites
    return allSites.filter(site => {
      const distance = calculateDistance(lat, lng, site.lat, site.lng)
      return distance <= 0.5 // 0.5 km radius
    })
  }

  const startJob = async () => {
    if (!currentLocation) {
      setMessage('Please enable location access to start a job.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      console.log('Starting job with location:', currentLocation)
      
      const nearby = checkNearbySites(currentLocation.lat, currentLocation.lng)
      console.log('Nearby sites:', nearby)
      
      if (nearby.length > 0) {
        setSelectedSite(nearby[0])
      }

      const jobData = {
        id: crypto.randomUUID(), // Generate local ID
        site_id: selectedSite?.id || null,
        start_time: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }
      
      console.log('Inserting job data:', jobData)

      if (useLocalStorage) {
        // Use local storage
        const newJob = { ...jobData }
        const updatedJobs = [...localJobs, newJob]
        setLocalJobs(updatedJobs)
        localStorage.setItem('logitrack-jobs', JSON.stringify(updatedJobs))
        
        setCurrentJob(newJob)
        setIsJobActive(true)
        setMessage('Job started successfully! (Local mode)')
      } else {
        // Use Supabase
        const { data: job, error } = await supabase
          .from('jobs')
          .insert(jobData)
          .select()
          .single()

        if (error) {
          console.error('Supabase error:', error)
          throw error
        }

        console.log('Job created successfully:', job)
        setCurrentJob(job)
        setIsJobActive(true)
        setMessage('Job started successfully!')
      }
    } catch (error) {
      console.error('Error starting job:', error)
      setMessage(`Error starting job: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const endJob = async () => {
    if (!currentJob || !currentLocation) return

    setLoading(true)
    setMessage('')

    try {
      const endTime = new Date()
      const startTime = new Date(currentJob.start_time)
      const workHours = calculateWorkHours(startTime, endTime)

      // Calculate travel distance (simplified - you can enhance this with Google Maps API)
      const travelKm = selectedSite ? calculateDistance(
        currentLocation.lat, currentLocation.lng,
        selectedSite.lat, selectedSite.lng
      ) * 2 : 0 // Round trip

      const fuelCost = calculateFuelCost(travelKm, fuelEfficiency, fuelPrice)

      if (useLocalStorage) {
        // Update job in local storage
        const updatedJobs = localJobs.map(job => 
          job.id === currentJob.id 
            ? {
                ...job,
                end_time: endTime.toISOString(),
                travel_km: travelKm,
                travel_time: workHours,
                fuel_cost: fuelCost,
                work_summary: workSummary,
              }
            : job
        )
        setLocalJobs(updatedJobs)
        localStorage.setItem('logitrack-jobs', JSON.stringify(updatedJobs))
        
        setIsJobActive(false)
        setCurrentJob(null)
        setSelectedSite(null)
        setWorkSummary('')
        setMessage('Job ended successfully! (Local mode)')
      } else {
        // Use Supabase
        const { error } = await supabase
          .from('jobs')
          .update({
            end_time: endTime.toISOString(),
            travel_km: travelKm,
            travel_time: workHours,
            fuel_cost: fuelCost,
            work_summary: workSummary,
          })
          .eq('id', currentJob.id)

        if (error) throw error

        setIsJobActive(false)
        setCurrentJob(null)
        setSelectedSite(null)
        setWorkSummary('')
        setMessage('Job ended successfully!')
      }
    } catch (error) {
      console.error('Error ending job:', error)
      setMessage(`Error ending job: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const createNewSite = async () => {
    if (!newSiteName || !currentLocation) return

    setLoading(true)
    setMessage('')

    try {
      const siteData = {
        id: crypto.randomUUID(),
        name: newSiteName,
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        first_visited: new Date().toISOString(),
      }

      if (useLocalStorage) {
        // Create site in local storage
        const newSite = { ...siteData }
        const updatedSites = [newSite, ...localSites]
        setLocalSites(updatedSites)
        localStorage.setItem('logitrack-sites', JSON.stringify(updatedSites))
        
        setSelectedSite(newSite)
        setNewSiteName('')
        setNearbySites([newSite, ...nearbySites])
        setMessage('New site created successfully! (Local mode)')
      } else {
        // Use Supabase
        const { data: site, error } = await supabase
          .from('sites')
          .insert({
            name: newSiteName,
            lat: currentLocation.lat,
            lng: currentLocation.lng,
          })
          .select()
          .single()

        if (error) throw error

        setSelectedSite(site)
        setNewSiteName('')
        setNearbySites([site, ...nearbySites])
        setMessage('New site created successfully!')
      }
    } catch (error) {
      console.error('Error creating site:', error)
      setMessage(`Error creating site: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
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
            <p className="text-sm text-red-600">Location not available</p>
          )}
        </div>

        {/* Job Controls */}
        <div className="flex gap-4">
          {!isJobActive ? (
            <button
              onClick={startJob}
              disabled={loading || !currentLocation}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Start Job'}
            </button>
          ) : (
            <button
              onClick={endJob}
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Ending...' : 'End Job'}
            </button>
          )}
        </div>

        {/* Site Selection */}
        {isJobActive && (
          <div className="space-y-4">
            <h3 className="font-semibold">Site Information</h3>
            
            {selectedSite ? (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium">Selected Site: {selectedSite.name}</p>
                <p className="text-sm text-gray-600">First visited: {new Date(selectedSite.first_visited).toLocaleDateString()}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Create New Site</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSiteName}
                      onChange={(e) => setNewSiteName(e.target.value)}
                      placeholder="Enter site name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={createNewSite}
                      disabled={!newSiteName || loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Fuel Settings */}
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

            {/* Work Summary */}
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
  )
} 