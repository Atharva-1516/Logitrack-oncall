'use client'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">LogiTrack OnCall</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button
                onClick={() => onTabChange('tracker')}
                className={`${
                  activeTab === 'tracker'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
              >
                Job Tracker
              </button>
              <button
                onClick={() => onTabChange('history')}
                className={`${
                  activeTab === 'history'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
              >
                Job History
              </button>
              <button
                onClick={() => onTabChange('reports')}
                className={`${
                  activeTab === 'reports'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
              >
                Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          <button
            onClick={() => onTabChange('tracker')}
            className={`${
              activeTab === 'tracker'
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
          >
            Job Tracker
          </button>
          <button
            onClick={() => onTabChange('history')}
            className={`${
              activeTab === 'history'
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
          >
            Job History
          </button>
          <button
            onClick={() => onTabChange('reports')}
            className={`${
              activeTab === 'reports'
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
          >
            Reports
          </button>
        </div>
      </div>
    </nav>
  )
} 