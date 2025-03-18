import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';
import Script from 'next/script';
import { UMAMI_WEBSITE_ID } from '@/constants';
import { SoftwareApplicationJsonLd, WebsiteJsonLd } from '@/components/JsonLd';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Holiday Optimizer',
  description: 'Optimize your Paid Time Off days to maximize your time off throughout the year.',
  keywords: 'holiday optimizer, PTO optimization, time off planning, vacation optimization, paid time off',
  authors: [{ name: 'Waqar Bin Kalim' }],
  creator: 'Waqar Bin Kalim',
  publisher: 'Waqar Bin Kalim',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://holiday-optimizer.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Holiday Optimizer - Maximize Your Time Off',
    description: 'Optimize your Paid Time Off days to maximize your time off throughout the year with our intelligent optimization tool.',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://holiday-optimizer.com',
    siteName: 'Holiday Optimizer',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Holiday Optimizer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Holiday Optimizer - Maximize Your Time Off',
    description: 'Optimize your Paid Time Off days to maximize your time off throughout the year.',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://holiday-optimizer.com';

  return (
    <html lang="en" suppressHydrationWarning>
    <Script defer src="https://cloud.umami.is/script.js" data-website-id={UMAMI_WEBSITE_ID} />
    <body className={`${inter.className} antialiased bg-white dark:bg-gray-950 transition-colors duration-200`}>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      disableTransitionOnChange
    >
      <WebsiteJsonLd
        url={baseUrl}
        name="Holiday Optimizer"
        description="Optimize your Paid Time Off days to maximize your time off throughout the year."
      />
      <SoftwareApplicationJsonLd
        name="Holiday Optimizer"
        description="An intelligent tool to optimize your PTO planning"
        applicationCategory="WebApplication"
        operatingSystem="Web"
      />
      <TooltipProvider>
        <div className="relative min-h-screen flex flex-col">
          <Header />
          <main id="main-content" className="flex-grow bg-gray-50 dark:bg-gray-900" role="main">
            {children}
          </main>
          <Footer />
        </div>
      </TooltipProvider>
      <Toaster richColors closeButton position="bottom-right" />
    </ThemeProvider>
    </body>
    </html>
  );
}
