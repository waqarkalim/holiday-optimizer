import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CTO Days Optimizer',
  description: 'Optimize your Compensatory Time Off days to maximize your time off throughout the year.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
    <body className={`${inter.className} antialiased bg-white dark:bg-gray-950 transition-colors duration-200`}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <div className="relative min-h-screen flex flex-col">
          <Header />
          <main id="main-content" className="flex-grow bg-gray-50 dark:bg-gray-900" role="main">
            {children}
          </main>
          <Footer />
        </div>
      </TooltipProvider>
    </ThemeProvider>
    </body>
    </html>
  );
}
