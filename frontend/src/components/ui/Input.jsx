import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

const Input = forwardRef(({
  label,
  error,
  className,
  required,
  ...props
}, ref) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white text-gray-900 ${
          error ? 'border-red-500' : ''
        }`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input 