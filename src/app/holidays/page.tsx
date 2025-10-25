import { Metadata } from 'next';
import { getAvailableCountries } from '@/services/holidays';
import { CalendarIcon, CheckCircleIcon, GlobeIcon } from 'lucide-react';
import {
  PageContent,
  PageDescription,
  PageHeader,
  PageLayout,
  PageTitle,
} from '@/shared/components/layout/PageLayout';

export const metadata: Metadata = {
  title: 'Public Holidays Around the World | Global Holiday Calendar',
  description:
    'Explore public holidays, bank holidays, and national observances for countries worldwide. Find holiday dates for over 100 countries to plan your international travel, business operations, and cultural events.',
  keywords:
    'public holidays, national holidays, bank holidays, world holidays, international holidays, global holidays, country holidays, holiday calendar, days off, vacation planning',
  openGraph: {
    title: 'Public Holidays Around the World | Global Holiday Calendar',
    description:
      'Explore public holidays and observances for countries around the world. Find information about national holidays, bank holidays, and more.',
    type: 'website',
    url: 'https://holidayoptimizer.com/holidays',
    siteName: 'Holiday Optimizer',
  },
  twitter: {
    card: 'summary',
    title: 'Public Holidays Around the World | Global Holiday Calendar',
    description:
      'Explore public holidays and observances for countries around the world. Find information about national holidays, bank holidays, and more.',
  },
  alternates: {
    canonical: 'https://holidayoptimizer.com/holidays',
  },
};

export default async function HolidaysIndexPage() {
  const countries = getAvailableCountries();

  const countryCount = countries.length;

  // Add schema.org structured data for better SEO
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Public Holidays Around the World',
    description:
      'Explore public holidays and observances for countries around the world. Find information about national holidays, bank holidays, and more.',
    url: 'https://holidayoptimizer.com/holidays',
    about: {
      '@type': 'Dataset',
      name: 'Global holiday coverage',
      numberOfItems: countryCount,
      description:
        'Holiday Optimizer maintains public holiday information for countries worldwide to power travel and planning workflows.',
    },
  };

  return (
    <PageLayout>
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Hero section */}
      <PageHeader className="bg-gradient-to-b from-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-400 via-indigo-500 to-blue-600"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center justify-center mb-5 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white">
            <CalendarIcon className="h-4 w-4 mr-2" aria-hidden="true" />
            <span className="text-sm font-medium">Worldwide Public Holidays</span>
          </div>

          <PageTitle className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight text-white">
            Discover Public Holidays <br className="hidden sm:block" />
            Around the World
          </PageTitle>

          <PageDescription className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            We track public holidays for {countryCount} countries worldwide. Use these insights to
            power your time-off plans, support global teams, or simply explore cultural
            celebrations.
          </PageDescription>

          <div className="flex flex-wrap gap-2 justify-center">
            <div className="inline-flex items-center px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/80">
              <span>National Holidays</span>
            </div>
            <div className="inline-flex items-center px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/80">
              <span>Bank Holidays</span>
            </div>
            <div className="inline-flex items-center px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/80">
              <span>Regional Observances</span>
            </div>
            <div className="inline-flex items-center px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/80">
              <span>School Holidays</span>
            </div>
          </div>
        </div>
      </PageHeader>

      {/* Main content */}
      <PageContent>
        <section className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Global Coverage Snapshot</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Holiday Optimizer aggregates official public holiday calendars across continents. The
              data feeds our planning tools and reporting, so you can align teams in advance of key
              observances.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                <GlobeIcon className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Worldwide Sources</h3>
              <p className="text-gray-600">
                Coverage spans {countryCount} countries with additional state and regional context
                where available.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                <CalendarIcon className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Actionable Context</h3>
              <p className="text-gray-600">
                Plan project timelines and release schedules around national events without digging
                through disparate calendars.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                <CheckCircleIcon className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Integrated Workflows</h3>
              <p className="text-gray-600">
                Use the optimizer to discover long weekends and maximize time off using the same
                data set.
              </p>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="bg-gray-100 py-16 mt-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Use Our Holiday Calendar?
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Our comprehensive public holiday database offers several benefits for travelers,
                businesses, and the culturally curious.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                  <GlobeIcon className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Comprehensive Coverage</h3>
                <p className="text-gray-600">
                  Access holiday information for {countryCount} countries worldwide,
                  including regional and local observances.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                  <CalendarIcon className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Current & Upcoming Years</h3>
                <p className="text-gray-600">
                  View holidays for both the current and upcoming year to plan ahead for vacations,
                  business operations, and events.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                  <CheckCircleIcon className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Accurate & Reliable</h3>
                <p className="text-gray-600">
                  Our data is based on reliable sources and regularly updated to ensure accuracy and
                  reliability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About section */}
        <section className="container mx-auto px-4 py-16 max-w-3xl">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-teal-600" />
                About Public Holidays
              </h2>
            </div>

            <div className="p-6 md:p-8 space-y-4 text-gray-600">
              <p>
                Public holidays, also known as national holidays or legal holidays, are days when
                most businesses, schools, and government offices are closed. These holidays are
                established by law and typically commemorate important historical, cultural, or
                religious events.
              </p>
              <p>
                Different countries have their own unique set of public holidays that reflect their
                history, culture, and traditions. Some holidays, like New Year&apos;s Day, are
                celebrated in many countries around the world, while others are specific to certain
                regions or cultures.
              </p>
              <p>
                Use this resource to explore public holidays for countries around the world and plan
                your travels, business operations, or simply learn about different cultural
                celebrations.
              </p>
            </div>
          </div>
        </section>
      </PageContent>
    </PageLayout>
  );
}
