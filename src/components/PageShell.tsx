import type { ReactNode } from 'react'
import { Topbar } from './Topbar'
import type { AppDestination } from '../types/ui'

type PageShellProps = {
  children: ReactNode
  onNavigate?: (page: AppDestination) => void
  onLogout?: () => void | Promise<void>
}

export function PageShell({ children, onNavigate, onLogout }: PageShellProps) {
  return (
    <div className="app-shell">
      <Topbar onNavigate={onNavigate} onLogout={onLogout} />
      <div className="page-transition">{children}</div>
    </div>
  )
}
