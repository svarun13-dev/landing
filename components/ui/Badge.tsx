import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
  size?: 'sm' | 'md'
}

const variants = {
  default: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  outline: 'border border-border bg-transparent text-foreground',
}

const sizes = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-1 text-sm',
}

export function Badge({
  className,
  variant = 'default',
  size = 'sm',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-medium',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}
