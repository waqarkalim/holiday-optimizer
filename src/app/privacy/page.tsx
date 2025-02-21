import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy Policy | CTO Planner",
  description: "Privacy policy for CTO Planner - Learn how we protect and handle your data.",
};

export default function PrivacyPolicy() {
  return (
    <main className="container mx-auto px-3 py-6 max-w-3xl">
      <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 p-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Privacy Policy</h1>
        <div className="prose dark:prose-invert max-w-none text-sm">
          <p className="text-base mb-4 text-gray-600 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-6">
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <span className="text-base">👋</span> Overview
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              CTO Planner is a static web application that runs entirely in your browser.
              I believe in privacy by design, which is why I've built this tool to operate
              without any data collection or external API calls.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <span className="text-base">🔒</span> No Data Collection
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              This application:
            </p>
            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-gray-600 dark:text-gray-400">
              <li>Does not collect any personal information</li>
              <li>Does not use cookies or local storage</li>
              <li>Does not make any external API calls</li>
              <li>Performs all calculations locally in your browser</li>
            </ul>
            <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
              Any data you input is processed entirely in your browser&apos;s memory and is cleared when you close the page.
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
              While I don't anticipate significant changes to this privacy policy (since I don't
              collect data), any updates will be reflected in the &ldquo;Last updated&rdquo; date above.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
} 