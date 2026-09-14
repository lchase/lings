import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

function withFieldClass(className: string | undefined) {
  return ['lings-field', className].filter(Boolean).join(' ')
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={withFieldClass(props.className)} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={withFieldClass(props.className)} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={withFieldClass(props.className)} />
}
