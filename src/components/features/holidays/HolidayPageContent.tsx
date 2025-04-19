'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { HolidaysTypes } from 'date-holidays';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ChevronRightIcon, GlobeIcon, InfoIcon, MapPinIcon } from 'lucide-react';
import Link from 'next/link';
import { getRegions, getStates } from '@/services/holidays';

interface HolidayPageContentProps {
  title: string;
  location: {
    country: string;
    state?: string;
    region?: string;
  };
  // Country, state, and region codes for navigation
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
      },
    ];

    if (countryCode) {
      crumbs.push({
        name: location.country,
        href: `/holidays/${countryCode.toLowerCase()}`,
      });
    }

    if (stateCode) {
      crumbs.push({
        name: location.state || '',
        href: `/holidays/${countryCode?.toLowerCase()}/${stateCode.toLowerCase()}`,
      });
    }

    if (regionCode) {
      crumbs.push({
        name: location.region || '',
        href: `/holidays/${countryCode?.toLowerCase()}/${stateCode?.toLowerCase()}/${regionCode.toLowerCase()}`,
      });
    }

    return (
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          {crumbs.map((crumb, index) => (
            <li key={crumb.href} className="inline-flex items-center">
              {index > 0 && (
                <svg className="w-3 h-3 mx-1 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                     fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="m1 9 4-4-4-4" />
                </svg>
              )}
              <Link
                href={crumb.href}
                className={`inline-flex items-center text-sm font-medium ${
                  index === crumbs.length - 1
                    ? 'text-teal-600 dark:text-teal-400'
                    : 'text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400'
                }`}
              >
                {index === 0 && <GlobeIcon className="w-3 h-3 mr-1" />}
                {crumb.name}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 lg:py-12 max-w-6xl">
      {/* Breadcrumb navigation */}
      {renderBreadcrumbs()}

      {/* Hero section */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-blue-500/5"></div>

        <div className="relative px-6 py-12 md:px-12 md:py-16 text-center">
          <div
            className="inline-flex items-center justify-center mb-4 px-4 py-1.5 bg-teal-50 dark:bg-teal-900/30 rounded-full">
            <CalendarIcon className="h-4 w-4 mr-2 text-teal-600 dark:text-teal-400" />
            <span className="text-sm font-medium text-teal-700 dark:text-teal-300">Public Holidays</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h1>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Badge variant="outline"
                   className="px-3 py-1 text-sm font-medium bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
              <GlobeIcon className="h-3.5 w-3.5 mr-1.5 text-teal-600 dark:text-teal-400" />
              {location.country}
              {location.state && `, ${location.state}`}
              {location.region && `, ${location.region}`}
            </Badge>

            <Badge variant="outline"
                   className="px-3 py-1 text-sm font-medium bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
              <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-teal-600 dark:text-teal-400" />
              {currentYear} - {nextYear}
            </Badge>
          </div>

          <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
            Find official public holidays and observances for {location.region || location.state || location.country},
            including dates, descriptions, and holiday types.
          </p>
        </div>
      </div>

      {/* Navigation to states or regions */}
      {(countryCode && !stateCode && states.length > 0) && (
        <div className="mb-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2 text-teal-600 dark:text-teal-400" />
              Explore States in {location.country}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select a state to view its specific holidays and observances
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 dark:bg-gray-700">
            {isLoadingStates ? (
              // Skeleton loaders
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="p-6 bg-white dark:bg-gray-800 flex items-center animate-pulse">
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 mr-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))
            ) : (
              // State links
              states.map(state => (
                <Link
                  key={state.code}
                  href={`/holidays/${countryCode?.toLowerCase()}/${state.code.toLowerCase()}`}
                  className="p-6 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors flex items-center group"
                >
                  <div
                    className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mr-3 flex-shrink-0">
                    <MapPinIcon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <span
                      className="font-medium text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {state.name}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">View holidays</p>
                  </div>
                  <ChevronRightIcon
                    className="h-5 w-5 ml-auto text-gray-400 group-hover:text-teal-500 transition-colors" />
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* Navigation to regions */}
      {(countryCode && stateCode && !regionCode && regions.length > 0) && (
        <div className="mb-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2 text-teal-600 dark:text-teal-400" />
              Explore Regions in {location.state}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select a region to view its specific holidays and observances
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 dark:bg-gray-700">
            {isLoadingRegions ? (
              // Skeleton loaders
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="p-6 bg-white dark:bg-gray-800 flex items-center animate-pulse">
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 mr-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))
            ) : (
              // Region links
              regions.map(region => (
                <Link
                  key={region.code}
                  href={`/holidays/${countryCode?.toLowerCase()}/${stateCode?.toLowerCase()}/${region.code.toLowerCase()}`}
                  className="p-6 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors flex items-center group"
                >
                  <div
                    className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mr-3 flex-shrink-0">
                    <MapPinIcon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <span
                      className="font-medium text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {region.name}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">View holidays</p>
                  </div>
                  <ChevronRightIcon
                    className="h-5 w-5 ml-auto text-gray-400 group-hover:text-teal-500 transition-colors" />
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* Holiday tabs for years */}
      <div className="mb-8">
        <Tabs defaultValue={currentYear.toString()} className="w-full">
          <TabsList className="w-full flex rounded-xl p-1 bg-gray-100 dark:bg-gray-800 mb-8">
            <TabsTrigger
              value={currentYear.toString()}
              className="flex-1 rounded-lg py-3 text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              {currentYear} Holidays
            </TabsTrigger>
            <TabsTrigger
              value={nextYear.toString()}
              className="flex-1 rounded-lg py-3 text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              {nextYear} Holidays
            </TabsTrigger>
          </TabsList>

          <TabsContent value={currentYear.toString()}>
            <HolidayCalendar holidays={currentYearHolidays} year={currentYear} />
          </TabsContent>

          <TabsContent value={nextYear.toString()}>
            <HolidayCalendar holidays={nextYearHolidays} year={nextYear} />
          </TabsContent>
        </Tabs>
      </div>

      {/* About section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mt-16">
        <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <InfoIcon className="h-5 w-5 mr-2 text-teal-600 dark:text-teal-400" />
            About Public Holidays in {location.country}
          </h2>
        </div>

        <div className="p-6 md:p-8">
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <p>
              Public holidays in <strong>{location.country}</strong> are days when most businesses, schools, and
              government offices are
              closed. These holidays are established by law and typically commemorate important historical, cultural, or
              religious
              events significant to {location.country}&apos;s heritage and identity.
            </p>
            <p>
              During public holidays in {location.country}, people often celebrate with family gatherings, special
              meals, or traditional activities.
              Many cultural events and festivals are organized around these important dates, showcasing the unique
              traditions and customs of {location.country}.
            </p>
            <p>
              Planning a trip to {location.country}? Understanding the public holiday calendar can help you experience
              local celebrations
              and traditions, or plan your itinerary around potential business closures and increased tourism activity
              during major holidays.
            </p>
          </div>

          {/* State information */}
          {location.state && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Local Observances in {location.state}
              </h3>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  <strong>{location.state}</strong> may have specific regional holidays or observances that are unique
                  to this part of {location.country}.
                  These local holidays contribute to the cultural identity of {location.state} and are often celebrated
                  with
                  community events and regional traditions that differ from the national celebrations.
                </p>
                <p>
                  Local observances in {location.state} help preserve the regional cultural heritage and strengthen
                  community bonds through shared celebrations.
                  Depending on local laws, some businesses and schools may close for these regional holidays,
                  particularly in {location.state}&apos;s major cities and towns.
                </p>
              </div>
            </div>
          )}

          {/* Region information */}
          {location.region && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Local Observances in {location.region}
              </h3>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  <strong>{location.region}</strong> has unique local observances and celebrations that may be specific
                  to this area of {location.state}.
                  These local holidays contribute to the distinct cultural identity of {location.region} and are often
                  celebrated with
                  community events and traditions that preserve local heritage.
                </p>
                <p>
                  Visitors to {location.region} during these local observances may experience unique cultural
                  activities, food specialties, and community gatherings
                  that showcase the local character and traditions of this specific area within {location.country}.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface HolidayCalendarProps {
  holidays: HolidaysTypes.Holiday[];
  year: number;
}

function HolidayCalendar({ holidays, year }: HolidayCalendarProps) {
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

  // Get type label and style
  const getHolidayTypeBadge = (type: string) => {
    switch (type) {
      case 'public':
        return {
          label: 'Public Holiday',
          className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30',
        };
      case 'bank':
        return {
          label: 'Bank Holiday',
          className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30',
        };
      case 'school':
        return {
          label: 'School Holiday',
          className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30',
        };
      case 'optional':
        return {
          label: 'Optional Holiday',
          className: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30',
        };
      default:
        return {
          label: 'Observance',
          className: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
        };
    }
  };

  if (Object.keys(holidaysByMonth).length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
        <div
          className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mx-auto flex items-center justify-center mb-4">
          <CalendarIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No holidays found</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          There are no public holidays available for this location and year.
        </p>
        <Link
          href="/holidays"
          className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
        >
          <GlobeIcon className="h-4 w-4 mr-2" />
          Explore other countries
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {Object.entries(holidaysByMonth).map(([month, monthHolidays]) => (
        <div key={month} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {/* Month header */}
          <div
            className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700 flex items-center">
            <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mr-3">
              <span className="font-medium text-teal-700 dark:text-teal-300">{month.substring(0, 3)}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{month} {year}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {monthHolidays.length} holiday{monthHolidays.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div
              className="ml-auto text-xs font-semibold rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 w-6 h-6 flex items-center justify-center">
              {monthHolidays.length}
            </div>
          </div>

          {/* Holiday list */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {monthHolidays.map((holiday, index) => {
              const date = new Date(holiday.date);
              const dayNumber = format(date, 'd');
              const dayName = format(date, 'EEEE');
              const { label: typeLabel, className: typeBadgeClass } = getHolidayTypeBadge(holiday.type);

              return (
                <div key={index} className="flex p-0">
                  {/* Date column */}
                  <div
                    className="w-20 sm:w-24 py-5 px-4 flex flex-col items-center justify-center border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dayNumber}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{dayName}</span>
                  </div>

                  {/* Holiday details */}
                  <div className="flex-1 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white">{holiday.name}</h4>
                      <Badge variant="outline"
                             className={`w-fit px-2 py-0.5 text-xs font-medium whitespace-nowrap ${typeBadgeClass}`}>
                        {typeLabel}
                      </Badge>
                    </div>

                    {holiday.substitute && (
                      <div
                        className="mt-2 text-xs bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 py-1 px-2 rounded inline-flex items-center">
                        <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Substitute holiday
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
