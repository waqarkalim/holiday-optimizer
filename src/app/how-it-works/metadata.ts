import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How Holiday Optimizer Works - PTO Optimization Algorithm Explained',
  description: 'Discover how our intelligent algorithm finds the best days to take off work. Learn about our optimization strategies and how they maximize your vacation time.',
  keywords: ['PTO optimization algorithm', 'vacation planning strategy', 'holiday optimizer explained', 'maximize time off', 'how it works', 'strategic PTO planning', 'optimization explanation'],
  alternates: {
    canonical: '/how-it-works',
  },
  openGraph: {
    title: 'How Holiday Optimizer Works - PTO Planning Algorithm Explained',
    description: 'Discover how our intelligent algorithm finds the best days to take off work. Learn about our optimization strategies and how they maximize your vacation time.',
    url: '/how-it-works',
    siteName: 'Holiday Optimizer',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Holiday Optimizer - How our PTO optimization algorithm works'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How Holiday Optimizer Works - PTO Planning Algorithm Explained',
    description: 'Discover how our intelligent algorithm finds the best days to take off work and maximizes your vacation time.',
    images: ['/twitter-image.png'],
  }
}; 