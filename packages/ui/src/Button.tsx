import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

export function Button({
  variant = 'secondary',
  className,
  ...props
}: ButtonProps) {
  const variantClass =
    variant === 'primary'
      ? 'lings-btn-primary'
      : variant === 'danger'
        ? 'lings-btn-danger'
        : 'lings-btn-secondary'

  return (
    <button
      type="button"
      {...props}
      className={['lings-btn', variantClass, className]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
