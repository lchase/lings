import type { HTMLAttributes } from 'react'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={['lings-card', className].filter(Boolean).join(' ')}
    />
  )
}
