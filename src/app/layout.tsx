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
import { SoftwareApplicationJsonLd, WebsiteJsonLd, FAQPageJsonLd, HowToJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';

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
      <FAQPageJsonLd
        faqs={[
          {
            question: "What is Holiday Optimizer?",
            answer: "Holiday Optimizer is a free tool that helps you plan your PTO days strategically to maximize your time off throughout the year."
          },
          {
            question: "How does Holiday Optimizer work?",
            answer: "Our algorithm analyzes your country's holidays and helps you determine the optimal days to use your limited PTO allocation for maximum consecutive days off."
          },
          {
            question: "Is Holiday Optimizer free to use?",
            answer: "Yes, Holiday Optimizer is completely free to use with no login required."
          },
          {
            question: "Can I save or share my optimized schedule?",
            answer: "Yes, you can export your optimized schedule and share it with others."
          },
          {
            question: "Which countries does Holiday Optimizer support?",
            answer: "Holiday Optimizer supports holidays for numerous countries and is continuously expanding its database."
          }
        ]}
      />
      <HowToJsonLd
        name="How to Optimize Your PTO Days"
        description="Learn how to use Holiday Optimizer to maximize your time off by strategically planning your PTO days around holidays."
        steps={[
          {
            name: "Select Your Country",
            text: "Choose your country from the dropdown menu to load the relevant holidays."
          },
          {
            name: "Set Your PTO Allocation",
            text: "Enter the number of PTO days you have available for the year."
          },
          {
            name: "Choose Your Year",
            text: "Select the year you want to plan for."
          },
          {
            name: "View Optimization Results",
            text: "Review the optimized schedule showing the best days to take off for maximum consecutive days off."
          },
          {
            name: "Export Your Schedule",
            text: "Save or share your optimized schedule with colleagues or family."
          }
        ]}
        totalTime="PT5M"
      />
      <BreadcrumbJsonLd
        items={[
          {
            name: "Home",
            url: baseUrl
          },
          {
            name: "Holiday Optimizer Tool",
            url: `${baseUrl}/`
          }
        ]}
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
