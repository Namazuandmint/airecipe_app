import { getStoredLanguage } from './i18n'

type CacheEntry<T> = {
  data: T
  timestamp: number
}

type InventoryCacheUpdate = {
  inventory?: unknown
}

type PreferencesCacheUpdate = {
  preferences?: unknown
}

type CompositeCache = {
  ingredients?: unknown
  recipes?: unknown
  preferences?: unknown
}

const store = new Map<string, CacheEntry<unknown>>()

const MAX_AGE_MS = 5 * 60 * 1000

export function getCache<T>(key: string): T | null {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > MAX_AGE_MS) {
    store.delete(key)
    return null
  }
  return entry.data as T
}

export function setCache<T>(key: string, data: T): void {
  store.set(key, { data, timestamp: Date.now() })
}

export function clearCache(): void {
  store.clear()
}

export function invalidateCache(pattern: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(pattern)) {
      store.delete(key)
    }
  }
}

function updateCompositeCache(
  prefix: string,
  update: Partial<CompositeCache>,
): void {
  for (const [key, entry] of store.entries()) {
    if (!key.startsWith(prefix)) {
      continue
    }

    const current = entry.data

    if (!current || typeof current !== 'object') {
      continue
    }

    store.set(key, {
      data: {
        ...(current as CompositeCache),
        ...update,
      },
      timestamp: Date.now(),
    })
  }
}

function updateInventoryCaches(inventory: unknown): void {
  let didUpdateExistingCache = false

  for (const key of store.keys()) {
    if (!key.startsWith('inventory:')) {
      continue
    }

    didUpdateExistingCache = true
    store.set(key, { data: inventory, timestamp: Date.now() })
  }

  if (!didUpdateExistingCache) {
    const language = getStoredLanguage() ?? 'ja'
    store.set(`inventory:${language}`, { data: inventory, timestamp: Date.now() })
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('inventory-updated', (event) => {
    const inventory = (event as CustomEvent<InventoryCacheUpdate>).detail
      ?.inventory

    if (!inventory) {
      invalidateCache('inventory:')
      return
    }

    updateInventoryCaches(inventory)
    updateCompositeCache('home:', { ingredients: inventory })
    updateCompositeCache('recipe-generate:', { ingredients: inventory })
  })
  window.addEventListener('preferences-updated', (event) => {
    const preferences = (event as CustomEvent<PreferencesCacheUpdate>).detail
      ?.preferences

    if (!preferences) {
      return
    }

    updateCompositeCache('home:', { preferences })
    updateCompositeCache('recipe-generate:', { preferences })
  })
}
