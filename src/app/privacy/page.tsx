import { PROJECT_NAME } from '@/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Privacy Policy | ${PROJECT_NAME}`,
  description: `Privacy policy for ${PROJECT_NAME} - Learn how we protect and handle your data.`,
};

export default function PrivacyPolicy() {
  return (
    <main className="container mx-auto px-3 py-6 max-w-3xl">
      <div
        className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 p-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Privacy Policy</h1>
        <div className="prose dark:prose-invert max-w-none text-sm">
          <p className="text-base mb-4 text-gray-600 dark:text-gray-400">Last
            updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-6">
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <span className="text-base">👋</span> Overview
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {PROJECT_NAME} is a web application that helps you optimize your holiday planning. While the core functionality
              runs in your browser, we do utilize some external services and local storage to enhance your experience.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <span className="text-base">🔒</span> Data Usage and Storage
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Here&apos;s how we handle your data:
            </p>
            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-gray-600 dark:text-gray-400">
              <li>We use local storage to save your preferences and holiday planning data</li>
              <li>All locally stored data remains on your device and is under your control</li>
              <li>You can clear this data at any time by clearing your browser&apos;s local storage</li>
              <li>We make API calls to external services for holiday data and calculations</li>
              <li>No personal information is shared with third parties without your consent</li>
            </ul>
            <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
              Your privacy is important to us - we only store what&apos;s necessary for the app to function effectively.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <span className="text-base">🌐</span> External Services & Browser APIs
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We utilize the following services and browser features:
            </p>
            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-gray-600 dark:text-gray-400">
              <li>Browser&apos;s Geolocation API - Used to detect your current location (with your permission)</li>
              <li>Nager.Date API - Used to fetch public holiday information for different countries</li>
              <li>BigDataCloud API - Used for location and timezone data to enhance holiday planning accuracy</li>
            </ul>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              These services and features are essential for providing accurate holiday and location data. When using these services:
            </p>
            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-gray-600 dark:text-gray-400">
              <li>Your browser will ask for permission before accessing your location</li>
              <li>Location data is only used temporarily and is not stored permanently</li>
              <li>Only necessary location data is shared with BigDataCloud for timezone and location lookup</li>
              <li>Only country codes and years are shared with Nager.Date for holiday data retrieval</li>
              <li>No personal or identifying information is ever shared with these services</li>
            </ul>
            <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
              For more information about these services&apos; privacy policies, you can visit their respective websites:
              <a href="https://www.bigdatacloud.com/privacy" className="text-blue-500 hover:text-blue-600 ml-1">BigDataCloud Privacy Policy</a>,
              <a href="https://date.nager.at/imprint" className="text-blue-500 hover:text-blue-600 ml-1">Nager.Date Imprint</a>, and
              <a href="https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API/Using_the_Geolocation_API#privacy" className="text-blue-500 hover:text-blue-600 ml-1">MDN Geolocation Privacy</a>.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <span className="text-base">📊</span> Analytics
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We use Umami Analytics, a privacy-focused analytics platform, to understand how our application is used:
            </p>
            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-gray-600 dark:text-gray-400">
              <li>Umami is cookie-free and fully GDPR compliant</li>
              <li>No personal information is collected</li>
              <li>Data collected includes: page views, referral sources, and country of origin</li>
              <li>All data is anonymized and cannot be traced back to individuals</li>
              <li>The analytics script is lightweight (less than 1KB) and doesn&apos;t impact site performance</li>
            </ul>
            <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
              For more information about Umami&apos;s privacy practices, visit their <a href="https://umami.is/privacy" className="text-blue-500 hover:text-blue-600">Privacy Policy</a>.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <span className="text-base">☁️</span> Hosting Infrastructure
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              The application is hosted on AWS as a static website. Standard server logs may be
              maintained by AWS for operational purposes, but these logs do not contain any
              personal information or usage data.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <span className="text-base">📖</span> Open Source
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              This is an open-source project, and its complete source code is available for review.
              You can verify my privacy practices by examining the code in my public repository.
            </p>
          </section>

          <section className="mb-0">
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <span className="text-base">🔄</span> Updates
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              While I don&apos;t anticipate significant changes to this privacy policy (since I don&apos;t
              collect data), any updates will be reflected in the &ldquo;Last updated&rdquo; date above.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
} 