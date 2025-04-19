'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRightIcon, GlobeIcon, SearchIcon } from 'lucide-react';
import { getEmojiFlag, TCountryCode } from 'countries-list';

type CountryInfo = {
  countryCode: string;
  name: string;
};

type CountrySearchProps = {
  groupedCountries: Record<string, Array<CountryInfo>>;
  sortedGroups: string[];
};

export default function CountrySearch({ groupedCountries, sortedGroups }: CountrySearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter countries based on search query
  const filteredGroups = searchQuery.trim() === '' 
    ? sortedGroups 
    : sortedGroups.filter(group => {
        // Check if any country in this group matches the search query
        return groupedCountries[group].some(country => 
          country.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });

  // For each group, filter the countries that match the search query
  const getFilteredCountries = (group: string) => {
    if (searchQuery.trim() === '') {
      return groupedCountries[group];
    }

    return groupedCountries[group].filter(country => 
      country.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <>
      {/* Search input */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Search countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <span className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* Country groups */}
      <div className="space-y-10">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 dark:text-gray-300">No countries found matching &quot;{searchQuery}&quot;</p>
          </div>
        ) : (
          filteredGroups.map(group => {
            const filteredCountriesInGroup = getFilteredCountries(group);

            if (filteredCountriesInGroup.length === 0) return null;

            return (
              <div key={group} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <GlobeIcon className="h-5 w-5 mr-2 text-teal-600 dark:text-teal-400" />
                    {group}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 dark:bg-gray-700">
                  {filteredCountriesInGroup.map(({ countryCode, name }) => (
                    <Link
                      key={countryCode}
                      href={`/holidays/${countryCode.toLowerCase()}`}
                      className="p-6 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors flex items-center group"
                    >
                      <div
                        className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mr-4 flex-shrink-0">
                        {getEmojiFlag(countryCode as TCountryCode)}
                      </div>
                      <div className="flex-1">
                        <span
                          className="font-medium text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {name}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          View public holidays
                        </p>
                      </div>
                      <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-teal-500 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
