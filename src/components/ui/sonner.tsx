"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-blue-50 dark:group-[.toaster]:bg-blue-900/90 group-[.toaster]:text-blue-800 dark:group-[.toaster]:text-blue-100 group-[.toaster]:border-blue-200 dark:group-[.toaster]:border-blue-800/30 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-blue-600 dark:group-[.toast]:text-blue-300",
          actionButton:
            "group-[.toast]:bg-blue-600 group-[.toast]:text-white dark:group-[.toast]:bg-blue-500",
          cancelButton:
            "group-[.toast]:bg-blue-100 group-[.toast]:text-blue-800 dark:group-[.toast]:bg-blue-800 dark:group-[.toast]:text-blue-200",
          success: 
            "group toast group-[.toaster]:bg-green-50 dark:group-[.toaster]:bg-green-900/90 group-[.toaster]:text-green-800 dark:group-[.toaster]:text-green-100 group-[.toaster]:border-green-200 dark:group-[.toaster]:border-green-800/30 group-[.toaster]:shadow-lg",
          error: 
            "group toast group-[.toaster]:bg-red-50 dark:group-[.toaster]:bg-red-900/90 group-[.toaster]:text-red-800 dark:group-[.toaster]:text-red-100 group-[.toaster]:border-red-200 dark:group-[.toaster]:border-red-800/30 group-[.toaster]:shadow-lg",
          warning: 
            "group toast group-[.toaster]:bg-amber-50 dark:group-[.toaster]:bg-amber-900/90 group-[.toaster]:text-amber-800 dark:group-[.toaster]:text-amber-100 group-[.toaster]:border-amber-200 dark:group-[.toaster]:border-amber-800/30 group-[.toaster]:shadow-lg",
          info: 
            "group toast group-[.toaster]:bg-blue-50 dark:group-[.toaster]:bg-blue-900/90 group-[.toaster]:text-blue-800 dark:group-[.toaster]:text-blue-100 group-[.toaster]:border-blue-200 dark:group-[.toaster]:border-blue-800/30 group-[.toaster]:shadow-lg",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
