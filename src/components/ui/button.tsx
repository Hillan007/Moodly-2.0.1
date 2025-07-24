import * as React from "react"
import { cn } from "@/lib/utils"

const buttonVariants = {
  variant: {
    default: "bg-blue-600 text-white hover:bg-blue-700 shadow-md border border-blue-600",
    destructive: "bg-red-600 text-white hover:bg-red-700 shadow-md border border-red-600",
    outline: "border-2 border-blue-600 bg-white text-blue-600 hover:bg-blue-50 shadow-sm",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 shadow-sm border border-gray-300",
    ghost: "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
    link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700",
  },
  size: {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-8 rounded-md px-3 text-sm",
    lg: "h-12 rounded-md px-8 text-base",
    icon: "h-10 w-10",
  },
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variant;
  size?: keyof typeof buttonVariants.size;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
