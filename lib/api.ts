export async function sendMessage(prompt: string, customSystemPrompt?: string): Promise<string> {
  const fullPrompt = customSystemPrompt 
    ? `[System Instructions: ${customSystemPrompt}]\n\nUser: ${prompt}`
    : prompt

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: fullPrompt })
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.success && data.response) {
      return data.response
    } else if (data.error) {
      throw new Error(data.error)
    } else {
      throw new Error('Error desconocido en la respuesta')
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Error de conexión con el servidor')
  }
}
