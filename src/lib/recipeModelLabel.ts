export type RecipeModelProvider = 'gemini' | 'groq'

export function getRecipeModelDisplayName(provider?: RecipeModelProvider) {
  if (provider === 'gemini') {
    return 'Gemini'
  }

  if (provider === 'groq') {
    return 'GPT'
  }

  return 'AI'
}

export function formatRecipeModelSource(
  provider?: RecipeModelProvider,
  modelName?: string,
) {
  if (!provider && !modelName) {
    return ''
  }

  const providerLabel = getRecipeModelDisplayName(provider)

  return modelName ? `${providerLabel}: ${modelName}` : providerLabel
}
