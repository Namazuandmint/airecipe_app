import { ApiError, postJson } from './apiClient'

declare global {
  interface Window {
    testGroq: (prompt: string) => Promise<void>
  }
}

export async function testGroqConnection(prompt: string) {
  const trimmedPrompt = prompt.trim()

  if (!trimmedPrompt) {
    console.error('[vite] Groq test prompt is required')
    return
  }

  try {
    const payload = await postJson<{
      completion?: {
        choices?: Array<{
          message?: {
            content?: string
          }
        }>
      }
    }>('/api/groq/chat', {
      messages: [
        {
          role: 'user',
          content: trimmedPrompt,
        },
      ],
      temperature: 0,
      max_tokens: 7500,
    })

    const content = payload.completion?.choices?.[0]?.message?.content
    console.info('[vite] Groq test response:', content ?? payload.completion)
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'unknown error'
    console.error('[vite] Groq test failed:', message)
  }
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.testGroq = testGroqConnection
  console.info('[vite] Groq test ready: run window.testGroq("your prompt")')
}
