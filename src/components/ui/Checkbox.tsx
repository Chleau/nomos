'use client'

import React, { forwardRef, useState, useEffect } from 'react'

type Size = 'md' | 'lg'
type State = 'checked' | 'unchecked' | 'indeterminate' | 'disabled'

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: Size
  state?: State
  label?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ size = 'md', state, label, className = '', checked: controlledChecked, disabled, onChange, ...props }, ref) => {
    const [isChecked, setIsChecked] = useState(controlledChecked || false)

    useEffect(() => {
      if (controlledChecked !== undefined) {
        setIsChecked(!!controlledChecked)
      }
    }, [controlledChecked])

    const sizeClasses = {
      md: 'w-5 h-5',
      lg: 'w-8 h-8'
    }

    // Determine state based on checked/disabled if not explicitly set
    let displayState = state
    if (!displayState) {
      if (disabled) displayState = 'disabled'
      else if (isChecked) displayState = 'checked'
      else displayState = 'unchecked'
    }

    const getCheckboxColor = (state: string | undefined) => {
      switch (state) {
        case 'checked':
          return 'border-[var(--color-primary)] bg-[var(--color-primary)]'
        case 'indeterminate':
          return 'border-[var(--color-primary)] bg-[var(--color-primary)]'
        case 'disabled':
          return 'border-[#cbd5e1] bg-[#f5fcfe]'
        case 'unchecked':
        default:
          return 'border-[#64748b] bg-[#f5fcfe]'
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsChecked(e.target.checked)
      if (onChange) onChange(e)
    }

    const wrapperClasses = `relative inline-flex items-center ${label ? 'gap-2' : ''}`

    return (
      <label className={wrapperClasses}>
        <input
          ref={ref}
          type="checkbox"
          checked={isChecked}
          disabled={disabled}
          onChange={handleChange}
          className="sr-only"
          {...props}
        />
        <div className={`relative ${sizeClasses[size]} cursor-pointer transition-colors ${getCheckboxColor(displayState)} border-2 rounded-md flex items-center justify-center ${disabled ? 'cursor-not-allowed' : ''}`}>
          {/* Checked icon */}
          {displayState === 'checked' && (
            <svg
              className="w-3/4 h-3/4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}

          {/* Indeterminate icon */}
          {displayState === 'indeterminate' && (
            <div className="w-1/2 h-0.5 bg-white rounded-full"></div>
          )}
        </div>

        {/* Label */}
        {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export default Checkbox
