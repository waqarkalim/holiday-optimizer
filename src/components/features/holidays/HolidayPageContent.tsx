'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { HolidaysTypes } from 'date-holidays';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ChevronRightIcon,
  CompassIcon,
  FlagIcon,
  GlobeIcon,
  InfoIcon,
  MapIcon,
  MapPinIcon,
} from 'lucide-react';
import Link from 'next/link';
import { getRegions, getStates } from '@/services/holidays';

interface HolidayPageContentProps {
  title: string;
  location: {
    country: string;
    state?: string;
    region?: string;
  };
  countryCode?: string;
  stateCode?: string;
  regionCode?: string;
  currentYearHolidays: HolidaysTypes.Holiday[];
  nextYearHolidays: HolidaysTypes.Holiday[];
}

export default function HolidayPageContent({
  title,
  location,
  countryCode,
  stateCode,
  regionCode,
  currentYearHolidays,
  nextYearHolidays,
}: HolidayPageContentProps) {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  const [states, setStates] = useState<Array<{ code: string; name: string }>>([]);
  const [regions, setRegions] = useState<Array<{ code: string; name: string }>>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);

  // Get upcoming holidays
  const getUpcomingHolidays = () => {
    const today = new Date();
    const currentHolidays = [...currentYearHolidays];
    currentHolidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return currentHolidays
      .filter(holiday => new Date(holiday.date) >= today)
      .slice(0, 3);
  };

  // Count holiday types
  const getHolidayTypeStats = () => {
    const typeCounts: Record<string, number> = {};

    currentYearHolidays.forEach(holiday => {
      typeCounts[holiday.type] = (typeCounts[holiday.type] || 0) + 1;
    });

    return typeCounts;
  };

  // Fetch states for the country
  useEffect(() => {
    if (countryCode && !stateCode) {
      setIsLoadingStates(true);
      try {
        const statesList = getStates(countryCode);
        setStates(statesList);
      } catch (error) {
        console.error('Error fetching states:', error);
      } finally {
        setIsLoadingStates(false);
      }
    }
  }, [countryCode, stateCode]);

  // Fetch regions for the state
  useEffect(() => {
    if (countryCode && stateCode && !regionCode) {
      const fetchRegions = async () => {
        setIsLoadingRegions(true);
        try {
          const regionsList = getRegions(countryCode, stateCode);
          setRegions(regionsList);
        } catch (error) {
          console.error('Error fetching regions:', error);
        } finally {
          setIsLoadingRegions(false);
        }
      };

      fetchRegions();
    }
  }, [countryCode, stateCode, regionCode]);

  // Render breadcrumb navigation
  const renderBreadcrumbs = () => {
    const crumbs = [
      { 
        name: 'Holidays', 
        href: '/holidays', 
        icon: <GlobeIcon className="w-3.5 h-3.5" /> 
      }
    ];

    if (countryCode) {
      crumbs.push({
        name: location.country,
        href: `/holidays/${countryCode.toLowerCase()}`,
        icon: <FlagIcon className="w-3.5 h-3.5" />
      });
    }

    if (stateCode) {
      crumbs.push({
        name: location.state || '',
        href: `/holidays/${countryCode?.toLowerCase()}/${stateCode.toLowerCase()}`,
        icon: <MapIcon className="w-3.5 h-3.5" />
      });
    }

    if (regionCode) {
      crumbs.push({
        name: location.region || '',
        href: `/holidays/${countryCode?.toLowerCase()}/${stateCode?.toLowerCase()}/${regionCode.toLowerCase()}`,
        icon: <MapPinIcon className="w-3.5 h-3.5" />
      });
    }

    return (
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center flex-wrap gap-2">
          {crumbs.map((crumb, index) => (
            <li key={crumb.href} className="inline-flex items-center">
              {index > 0 && (
                <ChevronRightIcon className="w-3.5 h-3.5 mx-1 text-gray-400" />
              )}
              <Link
                href={crumb.href}
                className={`inline-flex items-center px-2.5 py-1.5 text-sm rounded-md ${
                  index === crumbs.length - 1
                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <span className="mr-1.5">{crumb.icon}</span>
                {crumb.name}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  // Get parent route for back link
  const getParentRoute = () => {
    if (regionCode && stateCode) {
      return `/holidays/${countryCode?.toLowerCase()}/${stateCode.toLowerCase()}`;
    } else if (stateCode) {
      return `/holidays/${countryCode?.toLowerCase()}`;
    } else {
      return '/holidays';
    }
  };

  // Get context icon based on current page type
  const getContextIcon = () => {
    if (regionCode) {
      return <CompassIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />;
    } else if (stateCode) {
      return <MapIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />;
    } else {
      return <FlagIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />;
    }
  };

  // Add schema.org structured data for better SEO
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Holidays",
        "item": "https://holidayoptimizer.com/holidays"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": location.country,
        "item": countryCode ? `https://holidayoptimizer.com/holidays/${countryCode.toLowerCase()}` : ""
      },
      ...(location.state ? [{
        "@type": "ListItem",
        "position": 3,
        "name": location.state,
        "item": countryCode && stateCode ? `https://holidayoptimizer.com/holidays/${countryCode.toLowerCase()}/${stateCode.toLowerCase()}` : ""
      }] : []),
      ...(location.region ? [{
        "@type": "ListItem",
        "position": 4,
        "name": location.region,
        "item": countryCode && stateCode && regionCode ? `https://holidayoptimizer.com/holidays/${countryCode.toLowerCase()}/${stateCode.toLowerCase()}/${regionCode.toLowerCase()}` : ""
      }] : [])
    ]
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl" role="main" aria-labelledby="page-title">
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      {/* Header with improved styling and mobile optimization */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-5 p-3 sm:p-4" role="banner">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <Link
            href={getParentRoute()}
            className="inline-flex items-center text-sm text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 py-1.5 px-2 -ml-2 rounded-md"
            aria-label={`Back to ${regionCode ? 'state' : stateCode ? 'country' : 'all countries'} page`}
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            Back
          </Link>

          <div className="flex items-center">
            <Badge variant="outline" className="px-2.5 py-1 text-xs flex items-center">
              <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
              <span>{currentYear} - {nextYear}</span>
            </Badge>
          </div>
        </div>

        {renderBreadcrumbs()}

        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-md flex-shrink-0 hidden sm:block" aria-hidden="true">
            {getContextIcon()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="sm:hidden p-1.5 bg-teal-50 dark:bg-teal-900/20 rounded-md mr-1" aria-hidden="true">
                {getContextIcon()}
              </div>
              <h1 id="page-title" className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h1>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="px-2.5 py-1 text-xs flex items-center">
                <GlobeIcon className="h-3.5 w-3.5 mr-1.5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                <span className="truncate max-w-[200px] sm:max-w-none">
                  {location.country}
                  {location.state && `, ${location.state}`}
                  {location.region && `, ${location.region}`}
                </span>
              </Badge>
            </div>

            {/* Stats row for key metrics - mobile optimized */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center min-w-[120px]">
                <CalendarDaysIcon className="h-4 w-4 mr-2 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">{currentYearHolidays.length}</span> holidays
                </span>
              </div>

              {countryCode && !stateCode && states.length > 0 && (
                <div className="flex items-center min-w-[120px]">
                  <MapPinIcon className="h-4 w-4 mr-2 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{states.length}</span> states/regions
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 1. GEOGRAPHIC NAVIGATION - States/Regions navigation with prominent callout */}
      {(countryCode && !stateCode && states.length > 0) && (
        <div className="mb-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border-l-4 border-l-teal-500 dark:border-l-teal-600" role="region" aria-labelledby="states-heading">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-teal-50 to-transparent dark:from-teal-900/10 dark:to-transparent flex items-center justify-between">
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-2 text-teal-600 dark:text-teal-400" aria-hidden="true" />
              <h2 id="states-heading" className="text-sm font-medium text-gray-900 dark:text-white">Narrow By State/Province</h2>
            </div>
            <Badge variant="outline" className="bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400 border-0 text-xs">
              {states.length} available
            </Badge>
          </div>

          <div className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              View holidays specific to each state or province in {location.country}. Select one to see more detailed information.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {isLoadingStates ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="p-2 bg-gray-50 dark:bg-gray-800 animate-pulse h-10 rounded"></div>
                ))
              ) : (
                states.map(state => (
                  <Link
                    key={state.code}
                    href={`/holidays/${countryCode?.toLowerCase()}/${state.code.toLowerCase()}`}
                    className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-md border border-gray-200 dark:border-gray-700 flex items-center group transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mr-2.5 flex-shrink-0" aria-hidden="true">
                      <MapPinIcon className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <span className="text-sm text-gray-800 dark:text-gray-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate flex-1 font-medium">
                      {state.name}
                    </span>
                    <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-teal-500 flex-shrink-0" aria-hidden="true" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1. GEOGRAPHIC NAVIGATION - Regions navigation with prominent callout */}
      {(countryCode && stateCode && !regionCode && regions.length > 0) && (
        <div className="mb-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border-l-4 border-l-teal-500 dark:border-l-teal-600" role="region" aria-labelledby="regions-heading">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-teal-50 to-transparent dark:from-teal-900/10 dark:to-transparent flex items-center justify-between">
            <div className="flex items-center">
              <CompassIcon className="h-4 w-4 mr-2 text-teal-600 dark:text-teal-400" aria-hidden="true" />
              <h2 id="regions-heading" className="text-sm font-medium text-gray-900 dark:text-white">Narrow By Region</h2>
            </div>
            <Badge variant="outline" className="bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400 border-0 text-xs">
              {regions.length} available
            </Badge>
          </div>

          <div className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              View holidays specific to local regions within {location.state}, {location.country}. Select a region to see more detailed information.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {isLoadingRegions ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="p-2 bg-gray-50 dark:bg-gray-800 animate-pulse h-10 rounded"></div>
                ))
              ) : (
                regions.map(region => (
                  <Link
                    key={region.code}
                    href={`/holidays/${countryCode?.toLowerCase()}/${stateCode?.toLowerCase()}/${region.code.toLowerCase()}`}
                    className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-md border border-gray-200 dark:border-gray-700 flex items-center group transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mr-2.5 flex-shrink-0" aria-hidden="true">
                      <CompassIcon className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <span className="text-sm text-gray-800 dark:text-gray-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate flex-1 font-medium">
                      {region.name}
                    </span>
                    <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-teal-500 flex-shrink-0" aria-hidden="true" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. UPCOMING HOLIDAYS - enhanced design */}
      {getUpcomingHolidays().length > 0 && (
        <div className="mb-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700" role="region" aria-labelledby="upcoming-holidays-heading">
          <div className="px-4 py-3 bg-gradient-to-r from-teal-50 to-transparent dark:from-teal-900/20 dark:to-transparent border-b border-gray-100 dark:border-gray-700 flex items-center">
            <CalendarDaysIcon className="h-4 w-4 mr-2 text-teal-600 dark:text-teal-400" aria-hidden="true" />
            <h2 id="upcoming-holidays-heading" className="text-sm font-medium text-gray-900 dark:text-white">Upcoming Holidays</h2>
          </div>

          <ul className="divide-y divide-gray-100 dark:divide-gray-700" role="list">
            {getUpcomingHolidays().map((holiday, index) => {
              const date = new Date(holiday.date);
              const formattedDate = format(date, 'MMM d, yyyy');
              const daysUntil = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const month = format(date, 'MMM');
              const day = format(date, 'd');

              // Color based on proximity
              let proximityColor = "text-teal-600 dark:text-teal-400";
              if (daysUntil <= 7) {
                proximityColor = "text-amber-600 dark:text-amber-400";
              }
              if (daysUntil <= 1) {
                proximityColor = "text-red-600 dark:text-red-400";
              }

              return (
                <li key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors" role="listitem">
                  <div className="flex items-center px-4 py-3">
                    {/* Calendar-style date indicator */}
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-14 h-14 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-600 flex flex-col">
                        <div className="bg-teal-600 dark:bg-teal-700 text-white text-xs font-medium py-0.5 text-center">
                          {month}
                        </div>
                        <div className="bg-white dark:bg-gray-800 flex-grow flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{day}</span>
                        </div>
                      </div>
                    </div>

                    {/* Holiday details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                        {holiday.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <time dateTime={holiday.date} className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</time>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" aria-hidden="true"></span>
                        <span className={`text-xs font-medium ${proximityColor}`}>
                          {daysUntil === 0 ? 'Today' : 
                           daysUntil === 1 ? 'Tomorrow' : 
                           `In ${daysUntil} days`}
                        </span>
                      </div>

                      {/* Holiday type indicator */}
                      {holiday.type && (
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs ${
                          holiday.type === 'public' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 
                          holiday.type === 'bank' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                          holiday.type === 'school' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                          'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {holiday.type.charAt(0).toUpperCase() + holiday.type.slice(1)}
                        </span>
                      )}
                    </div>

                    {/* Visual countdown indicator */}
                    <div className="ml-4 flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                        daysUntil <= 1 ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' :
                        daysUntil <= 7 ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20' :
                        'border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20'
                      }`} aria-hidden="true">
                        <span className={`text-sm font-bold ${proximityColor}`}>
                          {daysUntil <= 99 ? daysUntil : '99+'}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 3. HOLIDAY CALENDAR - enhanced */}
      <div className="mb-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden" role="region" aria-labelledby="holiday-calendar-heading">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center">
          <CalendarIcon className="h-4 w-4 mr-2 text-teal-600 dark:text-teal-400" aria-hidden="true" />
          <h2 id="holiday-calendar-heading" className="text-sm font-medium text-gray-900 dark:text-white">Holiday Calendar</h2>
        </div>

        <div className="p-4">
          <Tabs defaultValue={currentYear.toString()} className="w-full">
            <TabsList className="w-full flex rounded-md border border-gray-200 dark:border-gray-700 p-1 bg-gray-50 dark:bg-gray-800 mb-4">
              <TabsTrigger
                value={currentYear.toString()}
                className="flex-1 rounded-md py-1.5 text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
              >
                <CalendarIcon className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                {currentYear}
              </TabsTrigger>
              <TabsTrigger
                value={nextYear.toString()}
                className="flex-1 rounded-md py-1.5 text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
              >
                <CalendarIcon className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                {nextYear}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={currentYear.toString()}>
              <HolidayList holidays={currentYearHolidays} />
            </TabsContent>

            <TabsContent value={nextYear.toString()}>
              <HolidayList holidays={nextYearHolidays} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 4. HOLIDAY TYPES - summary */}
      {Object.keys(getHolidayTypeStats()).length > 0 && (
        <div className="mb-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden" role="region" aria-labelledby="holiday-types-heading">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center">
            <FlagIcon className="h-4 w-4 mr-2 text-teal-600 dark:text-teal-400" aria-hidden="true" />
            <h2 id="holiday-types-heading" className="text-sm font-medium text-gray-900 dark:text-white">Holiday Types</h2>
          </div>

          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {Object.entries(getHolidayTypeStats()).map(([type, count]) => {
                let color;
                switch (type) {
                  case 'public':
                    color = 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400';
                    break;
                  case 'bank':
                    color = 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
                    break;
                  case 'school':
                    color = 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
                    break;
                  case 'optional':
                    color = 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
                    break;
                  default:
                    color = 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
                }

                return (
                  <div 
                    key={type} 
                    className={`px-3 py-1 rounded-full ${color} text-xs font-medium flex items-center`}
                  >
                    <span className="capitalize">{type}</span>
                    <span
                      className="ml-1 bg-white/70 dark:bg-gray-800/70 rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. ABOUT SECTION - with card styling */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden" role="region" aria-labelledby="about-holidays-heading">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center">
          <InfoIcon className="h-4 w-4 mr-2 text-teal-600 dark:text-teal-400" aria-hidden="true" />
          <h2 id="about-holidays-heading" className="text-sm font-medium text-gray-900 dark:text-white">About {regionCode ? 'Regional' : stateCode ? 'State' : 'National'} Holidays</h2>
        </div>

        <div className="p-4 text-sm text-gray-600 dark:text-gray-300">
          <p className="mb-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">Public holidays in {location.country}.</span> These are days when most businesses, schools, and government offices are closed.
          </p>
          {location.state && (
            <p className="mb-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">{location.state}</span> may have specific regional holidays unique to this part of {location.country}.
            </p>
          )}
          {location.region && (
            <p className="mb-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">{location.region}</span> has local observances specific to this area within {location.state}.
            </p>
          )}
          <div className="flex items-center mt-3 text-xs text-gray-400 dark:text-gray-500">
            <InfoIcon className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            Dates may vary based on local observations and official announcements
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced holiday list component
function HolidayList({ holidays }: { holidays: HolidaysTypes.Holiday[] }) {
  // Group holidays by month
  const holidaysByMonth: Record<string, HolidaysTypes.Holiday[]> = {};

  holidays.forEach(holiday => {
    const date = new Date(holiday.date);
    const month = format(date, 'MMMM');

    if (!holidaysByMonth[month]) {
      holidaysByMonth[month] = [];
    }

    holidaysByMonth[month].push(holiday);
  });

  if (Object.keys(holidaysByMonth).length === 0) {
    return (
      <div className="py-6 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 mx-auto flex items-center justify-center mb-3">
          <CalendarIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-gray-500 dark:text-gray-400">No holidays found for this location and year.</p>
        <Link
          href="/holidays"
          className="inline-block mt-3 text-sm text-teal-600 dark:text-teal-400 hover:underline"
        >
          Explore other countries
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(holidaysByMonth).map(([month, monthHolidays]) => (
        <div key={month} className="bg-gray-50 dark:bg-gray-750 rounded-lg overflow-hidden">
          <div className="px-4 py-3 flex items-center border-b border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 rounded-md bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mr-3">
              <span className="font-medium text-teal-600 dark:text-teal-400">{month.substring(0, 3)}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {month}
              <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-1.5">
                ({monthHolidays.length} {monthHolidays.length === 1 ? 'holiday' : 'holidays'})
              </span>
            </h3>
          </div>

          <ul className="divide-y divide-gray-200 dark:divide-gray-700" role="list">
            {monthHolidays.map((holiday, index) => {
              const date = new Date(holiday.date);
              const dayNumber = format(date, 'd');
              const dayName = format(date, 'EEE');

              // Type badge styling
              let typeLabel, typeBadgeClass;
              switch (holiday.type) {
                case 'public':
                  typeLabel = 'Public';
                  typeBadgeClass = 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-0';
                  break;
                case 'bank':
                  typeLabel = 'Bank';
                  typeBadgeClass = 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-0';
                  break;
                case 'school':
                  typeLabel = 'School';
                  typeBadgeClass = 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-0';
                  break;
                case 'optional':
                  typeLabel = 'Optional';
                  typeBadgeClass = 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-0';
                  break;
                default:
                  typeLabel = 'Observance';
                  typeBadgeClass = 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-0';
              }

              return (
                <li key={index} className="flex p-0" role="listitem">
                  <div className="w-16 flex-shrink-0 bg-white dark:bg-gray-800 py-3 px-2 flex flex-col items-center justify-center border-r border-gray-200 dark:border-gray-700">
                    <div className="font-semibold text-gray-900 dark:text-white">{dayNumber}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{dayName}</div>
                  </div>

                  <div className="flex-1 p-3">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {holiday.name}
                    </div>

                    <div className="flex items-center mt-1.5 space-x-1.5">
                      <Badge className={`px-1.5 py-0.5 text-xs ${typeBadgeClass}`}>
                        {typeLabel}
                      </Badge>

                      {holiday.substitute && (
                        <span className="text-xs text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-sm">
                          Substitute
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
