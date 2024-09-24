"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, Search, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"

interface Service {
  url: string
  status: boolean
  status_code: number
  response_time: number
  last_checked: string
  uptime_percentage: number
}

const MonitoringDashboard: React.FC<{ initialServices?: Service[] }> = ({ initialServices = [] }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [services, setServices] = useState<Service[]>(initialServices)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/monitor')
        const data = await response.json()
        console.log("Fetched data:", data)  // This will show the raw data from the API
        setServices(data)
      } catch (error) {
        console.error("Error fetching services:", error)
      }
    }

    fetchServices()

    const intervalId = setInterval(fetchServices, 5000)

    return () => clearInterval(intervalId)
  }, [])

  const filteredServices = services?.filter((service) =>
    service.url.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-6 h-6 text-green-500" />
    ) : (
      <AlertTriangle className="w-6 h-6 text-red-500" />
    )
  }

  const getUptimeColor = (percentage: number) => {
    if (percentage >= 99) return "text-green-500"
    if (percentage >= 95) return "text-yellow-500"
    return "text-red-500"
  }

  const allServicesUp = services.length > 0 && services.every(service => service.status)

  return (
    <div className="flex justify-center items-center w-screen h-screen bg-white">
      <div className="w-full max-w-4xl p-8 bg-white rounded-xl shadow-lg transition-all duration-300">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            System Status
          </h1>
          <div className="flex items-center space-x-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
              aria-label="Refresh status"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>

        <div className="mb-6 p-4 rounded-lg bg-gray-50 flex items-center space-x-3">
          {services.length > 0 ? (
            allServicesUp ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            )
          ) : (
            <RefreshCw className="w-6 h-6 text-gray-400" />
          )}
          <span className="text-lg font-medium">
            {services.length > 0 ? (
              allServicesUp ? "All services are running correctly" : "Some services are down"
            ) : (
              "Loading services status..."
            )}
          </span>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 rounded-full bg-gray-100 shadow-inner transition-all duration-300 focus:ring-2 focus:ring-blue-500 outline-none"
            aria-label="Search services"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        <div className="space-y-6">
          <AnimatePresence>
            {filteredServices.map((service) => (
              <motion.div
                key={service.url}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-200 rounded-full">
                      <Globe className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">{service.url}</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(service.status)}
                    <span className={`text-sm font-medium ${service.status ? 'text-green-500' : 'text-red-500'}`}>
                      {service.status ? "Operational" : "Down"}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  Last checked: {new Date(service.last_checked).toLocaleString()}
                </div>
                <div className="text-sm font-medium">
                  Uptime: {service.uptime_percentage !== undefined 
                    ? `${service.uptime_percentage.toFixed(2)}%` 
                    : 'N/A'}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default MonitoringDashboard;