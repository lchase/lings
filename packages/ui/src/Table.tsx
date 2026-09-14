import type { TableHTMLAttributes } from 'react'

export function Table({
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="lings-table-shell">
      <table
        {...props}
        className={['lings-table', className].filter(Boolean).join(' ')}
      />
    </div>
  )
}
