"use client"

import React from 'react'

type Size = 'lg' | 'md' | 'sm' | 'xs'
type Variant = 'primary' | 'outline' | 'ghost' | 'disabled' | 'pill' | 'orange' | 'favoris'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size
  variant?: Variant
}

const sizeMap: Record<Size, string> = {
  // Use explicit button classes defined in globals.css to avoid Tailwind missing utilities
  lg: 'btn--lg text-base',
  md: 'btn--md text-sm',
  sm: 'btn--sm text-sm',
  xs: 'btn--xs text-xs'
}

export default function Button({ size = 'md', variant = 'primary', className = '', children, disabled, ...props }: ButtonProps) {
  const base = 'btn inline-flex items-center justify-center transition-colors'

  const sizeClasses = sizeMap[size]

  let variantClasses = ''
  if (variant === 'primary') {
    // Filled primary (kaki)
    variantClasses = 'btn-kaki'
  } else if (variant === 'outline') {
    variantClasses = 'btn-outline'
  } else if (variant === 'ghost') {
    variantClasses = 'btn-ghost'
  } else if (variant === 'pill') {
    variantClasses = 'btn-pill'
  } else if (variant === 'disabled') {
    variantClasses = 'btn-disabled'
  } else if (variant === 'orange') {
    variantClasses = 'bg-[#e67e22] text-[#242a35] border border-[#e67e22] hover:bg-[#d35400] hover:text-white'
  } else if (variant === 'favoris') {
    variantClasses = 'btn-favoris'
  }

  const focusClasses = 'focus:outline-none'

  const classes = `${base} ${sizeClasses} ${variantClasses} ${focusClasses} ${className}`.trim()

  return (
    <button {...props} disabled={disabled || variant === 'disabled'} className={classes}>
      {children}
    </button>
  )
}
