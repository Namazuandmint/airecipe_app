import { generateGeminiContent } from './geminiApi'
import { ApiError, getJson } from './apiClient'

declare global {
  interface Window {
    testGemini: (prompt: string) => Promise<void>
    geminiUsage: () => Promise<void>
  }
}

async function fetchGeminiUsage() {
  return getJson<{ usage?: unknown }>('/api/gemini/usage')
}

export async function testGeminiConnection(prompt: string) {
  const trimmedPrompt = prompt.trim()

  if (!trimmedPrompt) {
    console.error('[vite] Gemini test prompt is required')
    return
  }

  try {
    const result = await generateGeminiContent({
      prompt: trimmedPrompt,
    })

    console.info('[vite] Gemini test response:', result.text || result.raw)
    console.info('[vite] Gemini final model:', result.model)
    console.info(
      '[vite] Gemini attempt order:',
      result.attemptedModels?.join(' -> ') || '(none)',
    )
    console.info(
      '[vite] Gemini skipped models:',
      result.skippedModels?.join(', ') || '(none)',
    )

    if (result.usage) {
      console.table(result.usage)
    }
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'unknown error'
    console.error('[vite] Gemini test failed:', message)

    try {
      console.info('[vite] Gemini usage after failure:', await fetchGeminiUsage())
    } catch (usageError) {
      console.warn('[vite] Gemini usage fetch failed:', usageError)
    }
  }
}

export async function logGeminiUsage() {
  try {
    console.info('[vite] Gemini usage:', (await fetchGeminiUsage()).usage)
  } catch (error) {
    console.error('[vite] Gemini usage fetch failed:', error)
  }
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.testGemini = testGeminiConnection
  window.geminiUsage = logGeminiUsage
  console.info('[vite] Gemini test ready: run window.testGemini("your prompt")')
  console.info('[vite] Gemini usage ready: run window.geminiUsage()')
}
