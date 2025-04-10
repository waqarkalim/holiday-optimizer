import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Holiday Optimizer - Maximize Time Off with Strategic PTO Planning',
  description: "Plan your time off smarter, not harder. This tool helps you identify the optimal PTO days to maximize your total time away from work using an intelligent algorithm.",
  keywords: ['PTO optimizer', 'vacation planning', 'holiday scheduling', 'time off calculator', 'work-life balance', 'strategic PTO', 'maximize vacation days', 'efficient time off', 'extended breaks', 'holiday optimizer'],
  openGraph: {
    title: 'Holiday Optimizer - Maximize Time Off with Strategic PTO Planning',
    description: "Plan your time off smarter, not harder. This tool helps you identify the optimal PTO days to maximize your total time away from work using an intelligent algorithm.",
    url: '/',
    siteName: 'Holiday Optimizer',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Holiday Optimizer - Maximize your time off by strategically planning your PTO days'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Holiday Optimizer - Maximize Time Off with Strategic PTO Planning',
    description: "Plan your time off smarter, not harder. This tool helps you identify the optimal PTO days to maximize your total time away from work.",
    images: ['/twitter-image.png'],
  }
}; 