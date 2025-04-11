'use client';

import Script from 'next/script';

interface WebsiteJsonLdProps {
  url: string;
  name: string;
  description: string;
}

export const WebsiteJsonLd = (props: WebsiteJsonLdProps) => (
  <Script
    id="website-jsonld"
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html:
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          ...props,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${props.url}?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        }),
    }}
    strategy="afterInteractive"
  />
);

interface SoftwareApplicationJsonLdProps {
  name: string;
  description: string;
  applicationCategory: string;
  operatingSystem: string;
}

export const SoftwareApplicationJsonLd = (props: SoftwareApplicationJsonLdProps) => (
  <Script
    id="software-jsonld"
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html:
        JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            ...props,
          },
        ),
    }}
    strategy="afterInteractive"
  />
);

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQPageJsonLdProps {
  faqs: FAQItem[];
}

export const FAQPageJsonLd = (props: FAQPageJsonLdProps) => (
  <Script
    id="faq-jsonld"
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: props.faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }),
    }}
    strategy="afterInteractive"
  />
);

interface HowToStep {
  name: string;
  text: string;
  url?: string;
  image?: string;
}

interface HowToJsonLdProps {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string; // ISO 8601 format e.g. "PT30M" for 30 minutes
  image?: string;
}

export const HowToJsonLd = (props: HowToJsonLdProps) => (
  <Script
    id="howto-jsonld"
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: props.name,
        description: props.description,
        step: props.steps.map((step, index) => ({
          '@type': 'HowToStep',
          ...step,
          position: index + 1,
        })),
        ...(props.totalTime && { totalTime: props.totalTime }),
        ...(props.image && { image: props.image }),
      }),
    }}
    strategy="afterInteractive"
  />
);

interface BreadcrumbJsonLdProps {
  items: {
    name: string;
    url: string;
  }[];
}

export const BreadcrumbJsonLd = (props: BreadcrumbJsonLdProps) => (
  <Script
    id="breadcrumb-jsonld"
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: props.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          ...item
        })),
      }),
    }}
    strategy="afterInteractive"
  />
);