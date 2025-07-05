import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

const Card = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={twMerge(
        'bg-white rounded-lg shadow-sm border border-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

Card.Header = ({ className, children, ...props }) => {
  return (
    <div
      className={twMerge(
        'px-6 py-4 border-b border-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

Card.Body = ({ className, children, ...props }) => {
  return (
    <div
      className={twMerge(
        'px-6 py-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

Card.Footer = ({ className, children, ...props }) => {
  return (
    <div
      className={twMerge(
        'px-6 py-4 border-t border-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card 