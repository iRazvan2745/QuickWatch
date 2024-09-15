'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ReloadIcon, PlusIcon, CheckIcon, Cross2Icon, ClockIcon, GlobeIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface MonitorData {
  URL: string
  Status: boolean
  StatusCode: number
  ResponseTime?: number
  LastChecked: string
}

export default function MonitoringDashboard() {
  const [monitorData, setMonitorData] = useState<MonitorData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newSiteUrl, setNewSiteUrl] = useState('')
  const { toast } = useToast()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/monitor')
      const data = await res.json()
      if (Array.isArray(data)) {
        setMonitorData(data)
      } else {
        console.error('Received data is not an array:', data)
        setMonitorData([])
      }
    } catch (error) {
      console.error('Error fetching monitor data:', error)
      setMonitorData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const handleAddSite = async () => {
    if (!newSiteUrl) {
      toast({
        title: "Error",
        description: "Please enter a valid URL.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/monitor/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: newSiteUrl }),
      })

      if (!response.ok) {
        throw new Error('Failed to add site')
      }

      // Refresh the monitor data
      await fetchData()

      setNewSiteUrl('')
      toast({
        title: "Site Added",
        description: `${newSiteUrl} has been added to monitoring.`,
      })
    } catch (error) {
      console.error('Error adding site:', error)
      toast({
        title: "Error",
        description: "Failed to add site. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
        <h1 className="text-4xl font-bold text-primary">Uptime Monitor Dashboard</h1>
        <div className="flex space-x-2">
          <Button onClick={fetchData} variant="outline" size="icon" className="hover:bg-secondary">
            <ReloadIcon className="h-4 w-4" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Site
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add a new site to monitor</DialogTitle>
                <DialogDescription>
                  Enter the URL of the site you want to monitor.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="url" className="text-right">
                    URL
                  </Label>
                  <Input
                    id="url"
                    value={newSiteUrl}
                    onChange={(e) => setNewSiteUrl(e.target.value)}
                    className="col-span-3"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddSite} className="bg-primary hover:bg-primary/90">Add Site</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <ReloadIcon className="h-16 w-16 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {monitorData.map((monitor) => (
            <Card key={monitor.URL} className="shadow-lg transition-all duration-300 hover:shadow-xl border-t-4 border-t-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold truncate">{monitor.URL}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between items-center mb-4">
                  <Badge variant={monitor.Status ? "default" : "destructive"} className="text-sm px-2 py-1">
                    {monitor.Status ? (
                      <CheckIcon className="w-4 h-4 mr-1" />
                    ) : (
                      <Cross2Icon className="w-4 h-4 mr-1" />
                    )}
                    {monitor.Status ? 'Up' : 'Down'}
                  </Badge>
                  <span className={`text-sm ${monitor.StatusCode >= 400 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    Status Code: {monitor.StatusCode}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    <span>Response Time: {monitor.ResponseTime ? `${monitor.ResponseTime.toFixed(2)}ms` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <GlobeIcon className="w-4 h-4 mr-2" />
                    <span className="truncate">{monitor.URL}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground flex justify-between items-center">
                <span>Last Checked: {new Date(monitor.LastChecked).toLocaleString()}</span>
                {!monitor.Status && (
                  <ExclamationTriangleIcon className="w-4 h-4 text-destructive" />
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}