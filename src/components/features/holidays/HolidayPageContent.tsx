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

  // Get upcoming holidays - next 3 holidays from current date
  const getUpcomingHolidays = () => {
    const today = new Date();
    const currentHolidays = [...currentYearHolidays];
    
    // Sort holidays by date
    currentHolidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Filter upcoming holidays
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

  // Render enhanced breadcrumb navigation
  const renderBreadcrumbs = () => {
    const crumbs = [
      {
        name: 'Holidays',
        href: '/holidays',
        icon: <GlobeIcon className="w-3.5 h-3.5" />
      },
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center flex-wrap gap-1.5">
            {crumbs.map((crumb, index) => (
              <li key={crumb.href} className="inline-flex items-center">
                {index > 0 && (
                  <ChevronRightIcon className="w-4 h-4 mx-1 text-gray-400" />
                )}
                <Link
                  href={crumb.href}
                  className={`inline-flex items-center px-2.5 py-1.5 text-sm font-medium rounded-md ${
                    index === crumbs.length - 1
                      ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-750'
                  }`}
                >
                  <span className="mr-1.5">{crumb.icon}</span>
                  {crumb.name}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    );
  };

  // Get context-specific UI elements based on current page type
  const getPageContext = () => {
    if (regionCode) {
      return {
        icon: <CompassIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />,
        label: 'Regional Holidays',
        parentLink: stateCode ? 
          `/holidays/${countryCode?.toLowerCase()}/${stateCode.toLowerCase()}` : 
          `/holidays/${countryCode?.toLowerCase()}`,
        parentLabel: `Back to ${location.state || location.country}`,
        description: `View public holidays specific to ${location.region} within ${location.state}, ${location.country}.`
      };
    } else if (stateCode) {
      return {
        icon: <MapIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />,
        label: 'State Holidays',
        parentLink: countryCode ? `/holidays/${countryCode?.toLowerCase()}` : '/holidays',
        parentLabel: `Back to ${location.country}`,
        description: `View public holidays observed in ${location.state}, including national and state-specific holidays.`
      };
    } else {
      return {
        icon: <FlagIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />,
        label: 'National Holidays',
        parentLink: '/holidays',
        parentLabel: 'All Countries',
        description: `View all public holidays observed in ${location.country} for ${currentYear} and ${nextYear}.`
      };
    }
  };

  const pageContext = getPageContext();

  return (
    <div className="container mx-auto py-8 px-4 lg:py-10 max-w-6xl">
      {/* Enhanced breadcrumb navigation */}
      {renderBreadcrumbs()}

      {/* Simplified Hero section with context */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-6 md:px-8 md:py-8 border-b border-gray-200 dark:border-gray-700">
          {/* Back link */}
          <Link
            href={pageContext.parentLink}
            className="inline-flex items-center text-sm text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 mb-4"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 mr-1.5" />
            {pageContext.parentLabel}
          </Link>
          
          <div className="flex items-start">
            <div className="mr-4 mt-1">
              <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                {pageContext.icon}
              </div>
            </div>
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="outline" className="px-3 py-1.5 text-sm flex items-center">
                  <GlobeIcon className="h-3.5 w-3.5 mr-2 text-teal-600 dark:text-teal-400" />
                  <span>{location.country}</span>
                  {location.state && `, ${location.state}`}
                  {location.region && `, ${location.region}`}
                </Badge>

                <Badge variant="outline" className="px-3 py-1.5 text-sm flex items-center">
                  <CalendarIcon className="h-3.5 w-3.5 mr-2 text-teal-600 dark:text-teal-400" />
                  <span>{currentYear} - {nextYear}</span>
                </Badge>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h1>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm max-w-3xl">
                {pageContext.description}
              </p>
            </div>
          </div>
          
          {/* Stats row */}
          <div className="flex flex-wrap gap-6 mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <CalendarDaysIcon className="h-5 w-5 mr-2 text-teal-600 dark:text-teal-400" />
              <div>
                <span
                  className="text-lg font-semibold text-gray-900 dark:text-white">{currentYearHolidays.length}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">Total Holidays</span>
              </div>
            </div>
            
            {countryCode && !stateCode && (
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2 text-teal-600 dark:text-teal-400" />
                <div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">{states.length}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">States/Regions</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center">
              <FlagIcon className="h-5 w-5 mr-2 text-teal-600 dark:text-teal-400" />
              <div>
                <span
                  className="text-lg font-semibold text-gray-900 dark:text-white">{Object.keys(getHolidayTypeStats()).length}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">Holiday Types</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Upcoming holidays preview - simplified inline version */}
        {getUpcomingHolidays().length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-750 px-6 py-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Upcoming Holidays</h3>
            <div className="space-y-2">
              {getUpcomingHolidays().map((holiday, index) => {
                const date = new Date(holiday.date);
                const formattedDate = format(date, 'MMM d, yyyy');
                const daysUntil = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={index} className="flex items-center text-sm">
                    <div
                      className="w-8 h-8 bg-white dark:bg-gray-800 rounded-md flex items-center justify-center mr-3 border border-gray-200 dark:border-gray-700">
                      <span className="font-medium text-gray-900 dark:text-white">{format(date, 'd')}</span>
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 dark:text-white">{holiday.name}</span>
                      <span className="text-gray-500 dark:text-gray-400 mx-1">·</span>
                      <span className="text-gray-500 dark:text-gray-400">{formattedDate}</span>
                    </div>
                    <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                      {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Holiday types - simplified inline */}
      {Object.keys(getHolidayTypeStats()).length > 0 && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
            <FlagIcon className="h-5 w-5 mr-2 text-teal-600 dark:text-teal-400" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Holiday Types</h2>
          </div>
          <div className="px-6 py-4">
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

      {/* States Navigation - enhanced with contextual header */}
      {(countryCode && !stateCode && states.length > 0) && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
            <MapPinIcon className="h-5 w-5 mr-2 text-teal-600 dark:text-teal-400" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">States and Provinces in {location.country}</h2>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {isLoadingStates ? (
                // Skeleton loaders
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="p-3 bg-gray-50 dark:bg-gray-750 rounded-lg flex items-center animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 mr-3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                ))
              ) : (
                // State links with simplified UI
                states.map(state => (
                  <Link
                    key={state.code}
                    href={`/holidays/${countryCode?.toLowerCase()}/${state.code.toLowerCase()}`}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg flex items-center group"
                  >
                    <div
                      className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mr-3 flex-shrink-0">
                      <MapPinIcon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1">
                      <span
                        className="font-medium text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {state.name}
                      </span>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-teal-500 transition-colors" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation to regions - with contextual header */}
      {(countryCode && stateCode && !regionCode && regions.length > 0) && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
            <CompassIcon className="h-5 w-5 mr-2 text-teal-600 dark:text-teal-400" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Regions in {location.state}</h2>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {isLoadingRegions ? (
                // Skeleton loaders
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="p-3 bg-gray-50 dark:bg-gray-750 rounded-lg flex items-center animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 mr-3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                ))
              ) : (
                // Region links with simplified UI
                regions.map(region => (
                  <Link
                    key={region.code}
                    href={`/holidays/${countryCode?.toLowerCase()}/${stateCode?.toLowerCase()}/${region.code.toLowerCase()}`}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg flex items-center group"
                  >
                    <div
                      className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mr-3 flex-shrink-0">
                      <MapPinIcon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1">
                      <span
                        className="font-medium text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {region.name}
                      </span>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-teal-500 transition-colors" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Holiday tabs for years - with contextual header */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-teal-600 dark:text-teal-400" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Holiday Calendar</h2>
        </div>
        
        <div className="p-4">
          <Tabs defaultValue={currentYear.toString()} className="w-full">
            <TabsList className="w-full flex rounded-xl p-1 bg-gray-100 dark:bg-gray-800 mb-6">
              <TabsTrigger
                value={currentYear.toString()}
                className="flex-1 rounded-lg py-2 text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                {currentYear} Holidays
              </TabsTrigger>
              <TabsTrigger
                value={nextYear.toString()}
                className="flex-1 rounded-lg py-2 text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
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
      </div>

      {/* About section - simplified */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <InfoIcon className="h-5 w-5 mr-2 text-teal-600 dark:text-teal-400" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            About {regionCode ? 'Regional' : stateCode ? 'State' : 'National'} Holidays
          </h2>
        </div>

        <div className="p-6">
          <div className="space-y-4 text-gray-600 dark:text-gray-300 text-sm">
            <p>
              Public holidays in <strong>{location.country}</strong> are days when most businesses, schools, and
              government offices are closed. These holidays commemorate important historical, cultural, or
              religious events significant to {location.country}'s heritage and identity.
            </p>
            <p>
              During public holidays, people often celebrate with family gatherings, special
              meals, or traditional activities. Many cultural events and festivals showcase the unique
              traditions and customs of {location.country}.
            </p>
            {location.state && (
              <p>
                <strong>{location.state}</strong> may have specific regional holidays that are unique
                to this part of {location.country}, contributing to the local cultural identity.
              </p>
            )}
            {location.region && (
              <p>
                <strong>{location.region}</strong> has unique local observances specific
                to this area of {location.state}, preserving local cultural heritage.
              </p>
            )}
          </div>
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
