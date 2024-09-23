"use client"

import { useState, useEffect } from "react"
import { Globe } from "lucide-react"
import { Badge } from '@/components/ui/badge' // Utilizing Shadcn UI Badge
import { Switch } from '@/components/ui/switch' // Utilizing Radix UI Switch
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Service {
  name: string
  icon: React.ReactNode
  status: "Operational" | "Degraded" | "Down"
  uptime: number
  uptimeHistory: { date: string; isUp: boolean }[]
}

export default function MonitoringDashboard({ initialServices }: { initialServices: Service[] }) {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [searchTerm, setSearchTerm] = useState("")
  const [isToggled, setIsToggled] = useState(false)

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/monitor")
        const data: Service[] = await response.json()
        setServices(data)
      } catch (error) {
        console.error("Error fetching services:", error)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-4xl p-6">
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Real-time monitoring of your services.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Switch
              checked={isToggled}
              onCheckedChange={() => setIsToggled(!isToggled)}
              className="ml-4"
            />
          </div>
          <div className="space-y-4">
            {filteredServices.map(service => (
              <Card key={service.name} className="bg-white shadow-md">
                <CardHeader className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    {/* Dynamically assign icons based on service name or status */}
                    {service.status === "Operational" ? <Globe className="w-5 h-5 text-green-500" /> : <Globe className="w-5 h-5 text-red-500" />}
                    <CardTitle>{service.name}</CardTitle>
                  </div>
                  <Badge variant={service.status === "Operational" ? "default" : "destructive"}>
                    {service.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  {/* Implement uptime history visualization using Recharts */}
                  <ResponsiveContainer width="100%" height={100}>
                    <BarChart data={service.uptimeHistory}>
                      <XAxis dataKey="date" hide />
                      <YAxis hide />
                      <Tooltip />
                      <Bar dataKey="isUp" fill={service.status === "Operational" ? "#4ade80" : "#f87171"} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
                <CardFooter>
                  <span>{`${service.uptime.toFixed(2)}% uptime`}</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export async function getServerSideProps() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/monitor`)
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
