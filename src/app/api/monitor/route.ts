import { NextResponse } from 'next/server'

const BACKEND_API_URL = process.env.BACKEND_API_URL

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/monitor`)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching monitor data:', error)
    return NextResponse.json({ error: 'Failed to fetch monitoring data' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const response = await fetch(`${BACKEND_API_URL}/api/monitor/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error adding monitor:', error)
    return NextResponse.json({ error: 'Failed to add monitor' }, { status: 500 })
  }
}