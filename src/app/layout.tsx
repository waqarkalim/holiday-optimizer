import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import React from 'react';
import Script from 'next/script';
import { UMAMI_WEBSITE_ID } from '@/constants';
import { SoftwareApplicationJsonLd, WebsiteJsonLd, FAQPageJsonLd, HowToJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';
import { Providers } from './Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Holiday Optimizer - Maximize Your PTO & Vacation Days',
  description: 'Strategically plan your PTO days to maximize time off with our free holiday optimizer tool. Find the optimal schedule using holidays, weekends, and company days off.',
  keywords: 'holiday optimizer, PTO optimization, time off planning, vacation optimization, paid time off, maximize vacation days, PTO calculator, vacation planner, strategic time off, holiday planning tool, work-life balance, extended weekends, optimization algorithm, best days to take off, time off scheduler',
  authors: [{ name: 'Waqar Bin Kalim' }],
  creator: 'Waqar Bin Kalim',
  publisher: 'Waqar Bin Kalim',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://holiday-optimizer.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Holiday Optimizer - Get More Time Off With Fewer PTO Days',
    description: 'Use this free tool to strategically plan your PTO around holidays and weekends. Maximize your time off with an intelligent optimization algorithm - no login required!',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://holiday-optimizer.com',
    siteName: 'Holiday Optimizer',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Holiday Optimizer - Strategic PTO Planning Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Holiday Optimizer - Strategic PTO Planning',
    description: 'Get more time off with fewer PTO days. Optimize your vacation schedule around holidays and weekends for maximum time away from work.',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
    other: {
      ...(process.env.NEXT_PUBLIC_BING_VERIFICATION && { 
        'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION 
      })
    }
  },
  category: 'productivity',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f0fdf4' },
    { media: '(prefers-color-scheme: dark)', color: '#064e3b' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://holiday-optimizer.com';

  return (
    <html lang="en" suppressHydrationWarning>
    <head>
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />
    </head>
    <Script defer src="https://cloud.umami.is/script.js" data-website-id={UMAMI_WEBSITE_ID} />
    <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6295400781172674" crossOrigin="anonymous" />
    <body className={`${inter.className} antialiased bg-white dark:bg-gray-950 transition-colors duration-200`}>
    <Providers>
      <WebsiteJsonLd
        url={baseUrl}
        name="Holiday Optimizer - Strategic PTO Planning Tool"
        description="Optimize your Paid Time Off days to maximize your time off throughout the year with an intelligent algorithm."
      />
      <SoftwareApplicationJsonLd
        name="Holiday Optimizer"
        description="An intelligent tool to optimize your PTO planning by strategically using holidays and weekends"
        applicationCategory="WebApplication"
        operatingSystem="Web"
        offers={{
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        }}
        aggregateRating={{
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "125",
          "reviewCount": "28",
          "bestRating": "5",
          "worstRating": "1"
        }}
      />
      <FAQPageJsonLd
        faqs={[
          {
            question: "What is Holiday Optimizer?",
            answer: "Holiday Optimizer is a free tool that helps you plan your PTO days strategically to maximize your time off throughout the year. The algorithm finds the optimal days to take off by analyzing holidays, weekends, and your custom settings."
          },
          {
            question: "How does Holiday Optimizer work?",
            answer: "The algorithm analyzes your country's public holidays, weekends, and company days off to help you determine the optimal days to use your limited PTO allocation. You can choose different strategies like maximizing consecutive days off or spreading your time throughout the year."
          },
          {
            question: "Is Holiday Optimizer free to use?",
            answer: "Yes, Holiday Optimizer is completely free to use with no login required. Everyone should have access to smart vacation planning tools."
          },
          {
            question: "Can I save or share my optimized schedule?",
            answer: "Yes, you can export your optimized schedule to your calendar or share it with friends, family, or colleagues with the easy sharing options."
          },
          {
            question: "Which countries does Holiday Optimizer support?",
            answer: "Holiday Optimizer supports holidays for numerous countries worldwide including the US, Canada, UK, Australia, Germany, India, Japan, and many more. The database is continuously expanding to include more regions."
          },
          {
            question: "Can I add my company's specific days off?",
            answer: "Absolutely! You can add custom company days off that don't count against your PTO, helping you create an even more optimized schedule tailored to your specific work calendar."
          },
          {
            question: "Do I need to create an account to use Holiday Optimizer?",
            answer: "No account needed! Holiday Optimizer is designed to be quick and easy to use without requiring registration. Your settings are saved locally on your device for convenience."
          }
        ]}
      />
      <HowToJsonLd
        name="How to Optimize Your PTO Days for Maximum Time Off"
        description="Learn how to use Holiday Optimizer to maximize your time off by strategically planning your PTO days around holidays, weekends, and company days off."
        steps={[
          {
            name: "Enter Your Available PTO Days",
            text: "Start by entering the number of Paid Time Off days you have available for the year."
          },
          {
            name: "Select Your Optimization Strategy",
            text: "Choose your preferred strategy: balanced, long weekends, or extended vacations."
          },
          {
            name: "Choose Your Country and Region",
            text: "Select your country and region to automatically load relevant public holidays."
          },
          {
            name: "Add Company-Specific Days Off",
            text: "Include any special company days off that don't count against your PTO allowance."
          },
          {
            name: "Generate Your Optimized Schedule",
            text: "Click to generate your personalized optimized schedule for maximum time away from work."
          },
          {
            name: "Export or Share Your Schedule",
            text: "Save your schedule to your calendar or share it with colleagues and family."
          }
        ]}
        totalTime="PT5M"
        image="/how-to-optimize-pto.jpg"
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
      <div className="relative min-h-screen flex flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black">Skip to content</a>
        <Header />
        <main id="main-content" className="flex-grow bg-gray-50 dark:bg-gray-900" role="main">
          {children}
        </main>
        <Footer />
      </div>
    </Providers>
    </body>
    </html>
  );
}
