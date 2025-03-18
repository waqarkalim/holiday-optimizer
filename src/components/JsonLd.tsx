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