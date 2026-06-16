type SupabaseStatus = {
  ok: boolean
  configured: boolean
  message: string
}

export async function checkSupabaseConnection(): Promise<SupabaseStatus> {
  try {
    return await fetch('/api/supabase/status').then(async (response) => {
      if (!response.ok) {
        return {
          ok: false,
          configured: false,
          message: 'Supabase status API failed',
        }
      }
      return (await response.json()) as SupabaseStatus
    })
  } catch {
    return {
      ok: false,
      configured: false,
      message: 'Supabase server is not reachable',
    }
  }
}

if (import.meta.env.DEV) {
  void checkSupabaseConnection().then((status) => {
    console.info(`[vite] ${status.message}`)
  })
}
