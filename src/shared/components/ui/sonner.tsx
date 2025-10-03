'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-800 group-[.toaster]:border-blue-200 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-blue-600',
          actionButton: 'group-[.toast]:bg-blue-600 group-[.toast]:text-white',
          cancelButton: 'group-[.toast]:bg-blue-100 group-[.toast]:text-blue-800',
          success:
            'group toast group-[.toaster]:bg-green-50 group-[.toaster]:text-green-800 group-[.toaster]:border-green-200 group-[.toaster]:shadow-lg',
          error:
            'group toast group-[.toaster]:bg-red-50 group-[.toaster]:text-red-800 group-[.toaster]:border-red-200 group-[.toaster]:shadow-lg',
          warning:
            'group toast group-[.toaster]:bg-amber-50 group-[.toaster]:text-amber-800 group-[.toaster]:border-amber-200 group-[.toaster]:shadow-lg',
          info: 'group toast group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-800 group-[.toaster]:border-blue-200 group-[.toaster]:shadow-lg',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
