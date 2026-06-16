import { postJson } from './apiClient'

export type GeminiGenerateResult = {
  model: string
  attemptedModels?: string[]
  skippedModels?: string[]
  usage?: Array<{
    model: string
    limit: number
    used: number
    remaining: number
    resetInMs: number
  }>
  text: string
  images: Array<{
    mimeType: string
    data: string
  }>
  raw: unknown
}

export async function generateGeminiContent({
  prompt,
  imageBase64,
  mimeType,
  model,
  responseMimeType,
}: {
  prompt: string
  imageBase64?: string
  mimeType?: string
  model?: string
  responseMimeType?: string
}) {
  return postJson<GeminiGenerateResult>('/api/gemini/generate', {
    prompt,
    imageBase64,
    mimeType,
    model,
    responseMimeType,
  })
}
