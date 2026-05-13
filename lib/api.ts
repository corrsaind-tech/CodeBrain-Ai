const API_URL = "http://93.177.64.145:9200/ia/corehub-v1/chat"
const API_KEY = "anesuri.3415.3dd"

export async function sendMessage(prompt: string, customSystemPrompt?: string): Promise<string> {
  const fullPrompt = customSystemPrompt 
    ? `[System Instructions: ${customSystemPrompt}]\n\nUser: ${prompt}`
    : prompt

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({ prompt: fullPrompt })
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.success && data.response) {
      return data.response
    } else {
      throw new Error(data.error || 'Error desconocido en la respuesta')
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Error de conexión con el servidor')
  }
}
