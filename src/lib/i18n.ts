export { jaMessages } from './i18n/ja'
export type { MessageKey } from './i18n/ja'
export { enMessages } from './i18n/en'
export { frMessages } from './i18n/fr'

export const supportedLanguages = [
  { code: 'ja', label: '日本語', description: '日本語で表示します' },
  { code: 'en', label: 'English', description: 'Display in English' },
  { code: 'fr', label: 'Français', description: 'Afficher en français' },
] as const

export type LanguageCode = (typeof supportedLanguages)[number]['code']

export type TranslationValues = Record<string, string | number>

export const defaultLanguage: LanguageCode = 'ja'

import { enMessages } from './i18n/en'
import { frMessages } from './i18n/fr'
import { jaMessages, type MessageKey } from './i18n/ja'

const messages: Record<LanguageCode, Record<MessageKey, string>> = {
  ja: jaMessages,
  en: enMessages,
  fr: frMessages,
}

export type TranslateFn = (
  key: MessageKey,
  values?: TranslationValues,
) => string

export function isLanguageCode(value: string): value is LanguageCode {
  return supportedLanguages.some((language) => language.code === value)
}

export function getStoredLanguage(): LanguageCode | null {
  if (typeof window === 'undefined') {
    return null
  }

  const storedLanguage = window.localStorage.getItem('ai-recipe-language')

  return storedLanguage && isLanguageCode(storedLanguage)
    ? storedLanguage
    : null
}

export function getInitialLanguage(): LanguageCode {
  const storedLanguage = getStoredLanguage()

  if (storedLanguage) {
    return storedLanguage
  }

  if (typeof navigator === 'undefined') {
    return defaultLanguage
  }

  const browserLanguages = [
    navigator.language,
    ...(navigator.languages ?? []),
  ].filter(Boolean)

  for (const browserLanguage of browserLanguages) {
    const baseLanguage = browserLanguage.toLowerCase().split('-')[0]

    if (isLanguageCode(baseLanguage)) {
      return baseLanguage
    }
  }

  return defaultLanguage
}

export function saveLanguage(language: LanguageCode) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem('ai-recipe-language', language)
}

export function translate(
  language: LanguageCode,
  key: MessageKey,
  values?: TranslationValues,
) {
  const template = messages[language][key] ?? messages[defaultLanguage][key]

  if (!values) {
    return template
  }

  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, token: string) =>
    String(values[token] ?? `{${token}}`),
  )
}
