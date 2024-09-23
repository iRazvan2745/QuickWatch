import { NextResponse } from 'next/server'

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/monitor`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch monitoring data' }, { status: response.status })
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching monitor data:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }
    const response = await fetch(`${BACKEND_API_URL}/api/monitor/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: body.url }),
    })
    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.error }, { status: response.status })
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error adding monitor:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}