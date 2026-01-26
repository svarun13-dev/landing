'use client'

import * as React from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  className?: string
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  label,
  error,
  disabled,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={cn('w-full', className)} ref={ref}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-lg border border-border bg-secondary px-3 py-2 text-sm transition-colors',
            disabled
              ? 'cursor-not-allowed opacity-50'
              : 'hover:border-muted-foreground',
            isOpen && 'ring-2 ring-ring',
            error && 'border-destructive'
          )}
        >
          <span className="flex items-center gap-2">
            {selectedOption?.icon}
            <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
              {selectedOption?.label || placeholder}
            </span>
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card py-1 shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (!option.disabled) {
                    onChange(option.value)
                    setIsOpen(false)
                  }
                }}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-sm transition-colors',
                  option.disabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:bg-secondary',
                  option.value === value && 'bg-primary/10 text-primary'
                )}
              >
                <span className="flex items-center gap-2">
                  {option.icon}
                  {option.label}
                </span>
                {option.value === value && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}
