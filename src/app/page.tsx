import MonitoringDashboard from '../components/MonitoringDashboard'

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://qwapi.irazz.lol';

async function getInitialServices() {
  try {
    const res = await fetch(`${BACKEND_API_URL}/api/monitor`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch data')
    return res.json()
  } catch (error) {
    console.error('Error fetching initial services:', error)
    return [] // Return an empty array if there's an error
  }
}

export default async function Home() {
  const initialServices = await getInitialServices()
  return (
    <main className="container mx-auto p-4">
      <MonitoringDashboard initialServices={initialServices} />
    </main>
  )
}