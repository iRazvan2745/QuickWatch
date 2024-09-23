"use client"

import MonitoringDashboard from '../components/MonitoringDashboard'
import { useState, useEffect } from 'react'

interface ServiceItem {
  url: string;
  status: boolean;
  last_checked: string;
}

interface MappedService {
  name: string;
  icon: null;
  status: "Operational" | "Down";
  uptime: number;
  uptimeHistory: Array<{ date: string; isUp: boolean }>;
}

export default function Home() {
  const [initialServices, setInitialServices] = useState<MappedService[]>([])

  useEffect(() => {
    const fetchInitialServices = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/monitor')
        const data: ServiceItem[] = await response.json()
        const mappedServices: MappedService[] = data.map((item: ServiceItem) => ({
          name: item.url,
          icon: null, // We'll set the icon in the MonitoringDashboard component
          status: item.status ? "Operational" : "Down",
          uptime: item.status ? 100 : 0,
          uptimeHistory: [{ date: item.last_checked, isUp: item.status }]
        }))
        setInitialServices(mappedServices)
      } catch (error) {
        console.error("Error fetching initial services:", error)
      }
    }

    fetchInitialServices()
  }, [])

  return (
    <main className="container mx-auto p-4">
      <MonitoringDashboard initialServices={initialServices} />
    </main>
  )
}