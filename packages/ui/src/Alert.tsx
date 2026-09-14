import type { ReactNode } from 'react'

export type AlertTone = 'info' | 'warning' | 'error' | 'success'

export type AlertProps = {
  tone: AlertTone
  title: string
  children?: ReactNode
}

export function Alert({ tone, title, children }: AlertProps) {
  return (
    <div className={`lings-alert lings-alert-${tone}`}>
      <span className="lings-alert-dot" />
      <div>
        <p className="lings-alert-title">{title}</p>
        {children && <p className="lings-alert-body">{children}</p>}
      </div>
    </div>
  )
}
