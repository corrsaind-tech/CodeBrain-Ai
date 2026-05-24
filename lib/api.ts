export interface ChatOptions {
  model?: 'auto' | 'corehub-coder.1' | 'corehub-coder.1.2' | 'corehub-coder.1-instruct'
  force_coding?: boolean
  system_prompt?: string
}

export async function sendMessage(prompt: string, options?: ChatOptions): Promise<{ response: string; model_name?: string; response_time_ms?: number }> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: options?.model || 'auto',
        force_coding: options?.force_coding || false,
        system_prompt: options?.system_prompt,
      })
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.response) {
      return {
        response: data.response,
        model_name: data.model_name,
        response_time_ms: data.response_time_ms,
      }
    } else if (data.error) {
      throw new Error(data.error)
    } else {
      throw new Error('Error desconocido en la respuesta')
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Error de conexion con el servidor')
  }
}
