"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, Search, RefreshCw } from "lucide-react"

interface Service {
  name: string
  icon: React.ReactNode
  status: "Operational" | "Degraded" | "Down"
  uptime: number
  uptimeHistory: { date: string; isUp: boolean }[]
}

export default function Component({ initialServices }: { initialServices: Service[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [services, setServices] = useState<Service[]>(initialServices)

  useEffect(() => {
    // Dark/light mode functionality removed
  }, [])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${process.env.BACKEND_API_URL}/api/monitor`)
        const data = await response.json()
        const mappedServices = data.map((item: { url: string; status: boolean; last_checked: string }) => ({
          name: item.url,
          icon: <Globe className="w-5 h-5" />, // Use a generic icon for all services
          status: item.status ? "Operational" : "Down",
          uptime: item.status ? 100 : 0, // Simplified uptime calculation 
          uptimeHistory: [{ date: item.last_checked, isUp: item.status }]
        }))
        setServices(mappedServices)
      } catch (error) {
        console.error("Error fetching services:", error)
      }
    }

    fetchServices()

    const intervalId = setInterval(fetchServices, 5000) // Fetch services every 5 seconds

    return () => clearInterval(intervalId) // Cleanup interval on component unmount
  }, [])

  const filteredServices = services?.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const getStatusColor = (status: Service["status"]) => {
    switch (status) {
      case "Operational":
        return "text-green-500"
      case "Degraded":
        return "text-yellow-500"
      case "Down":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

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
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 rounded-full bg-gray-100 shadow-inner transition-all duration-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        <div className="space-y-6">
          <AnimatePresence>
            {filteredServices.map((service) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-200 rounded-full">
                      {service.icon}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">{service.name}</h2>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
                <div className="relative">
                  <div className="flex space-x-px h-10 mb-1 overflow-hidden rounded-md">
                    {service.uptimeHistory.map((day, index) => (
                      <motion.div
                        key={index}
                        initial={{ height: 0 }}
                        animate={{ height: "100%" }}
                        transition={{ duration: 0.5, delay: index * 0.01 }}
                        className={`w-1 ${day.isUp ? 'bg-green-500' : 'bg-red-500'} relative group`}
                      >
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                          {day.date}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full bg-gray-50 opacity-20 pointer-events-none"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>90 days ago</span>
                  <span className="text-center w-full">{service.uptime.toFixed(2)}% uptime</span>
                  <span>Today</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps() {
  try {
    const response = await fetch('http://localhost:8080/api/monitor') // Adjust the endpoint as needed
    const data = await response.json()
    const initialServices = data.map((item: { url: string; status: boolean; last_checked: string }) => ({
      name: item.url,
      icon: <Globe className="w-5 h-5" />, // Use a generic icon for all services
      status: item.status ? "Operational" : "Down",
      uptime: item.status ? 100 : 0, // Simplified uptime calculation
      uptimeHistory: [{ date: item.last_checked, isUp: item.status }]
    }))
    return { props: { initialServices } }
  } catch (error) {
    console.error("Error fetching services:", error)
    return { props: { initialServices: [] } }
  }
}
