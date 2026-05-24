import { NextRequest, NextResponse } from 'next/server'

const COREHUB_API_URL = 'http://93.177.64.145:9200/ia/corehub-v1/chat'
const COREHUB_API_KEY = 'anesuri.3415.3dd'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const payload = {
      prompt: body.prompt,
      model: body.model || 'auto',
      force_coding: body.force_coding || false,
      system_prompt: body.system_prompt || undefined,
    }
    
    const response = await fetch(COREHUB_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': COREHUB_API_KEY,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[v0] CoreHub API error:', response.status, errorText)
      return NextResponse.json(
        { error: `API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[v0] Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to AI service' },
      { status: 500 }
    )
  }
}
