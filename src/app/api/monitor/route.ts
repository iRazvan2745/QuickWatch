import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('http://localhost:8080/api/monitor')
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching monitor data:', error)
    return NextResponse.json({ error: 'Failed to fetch monitoring data' }, { status: 500 })
  }
}