import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Spinner } from './Spinner'

const Button = forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 shadow-sm hover:shadow-md',
    outline: 'border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500 shadow-sm hover:shadow-md',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-md hover:shadow-lg',
    warning: 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500 shadow-md hover:shadow-lg',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    gradient: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:scale-105'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      ref={ref}
      className={twMerge(
        baseStyles,
        variants[variant],
        sizes[size],
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed hover:transform-none',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Spinner
          className="mr-2"
          size={size === 'sm' ? 'sm' : 'md'}
        />
      )}
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export default Button 