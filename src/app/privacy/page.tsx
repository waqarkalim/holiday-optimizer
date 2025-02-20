import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy Policy | CTO Planner",
  description: "Privacy policy for CTO Planner - Learn how we protect and handle your data.",
};

export default function PrivacyPolicy() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">👋 Overview</h2>
          <p>
            CTO Planner is a static web application that runs entirely in your browser.
            We believe in privacy by design, which is why we've built this tool to operate
            without any data collection or external API calls.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">🔒 No Data Collection</h2>
          <p>
            This application:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Does not collect any personal information</li>
            <li>Does not use cookies or local storage</li>
            <li>Does not make any external API calls</li>
            <li>Performs all calculations locally in your browser</li>
          </ul>
          <p className="mt-4 text-sm italic">
            Any data you input is processed entirely in your browser's memory and is cleared when you close the page.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">☁️ Hosting Infrastructure</h2>
          <p>
            The application is hosted on AWS as a static website. Standard server logs may be
            maintained by AWS for operational purposes, but these logs do not contain any
            personal information or usage data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">📖 Open Source</h2>
          <p>
            This is an open-source project, and its complete source code is available for review.
            You can verify our privacy practices by examining the code in our public repository.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">🔄 Updates</h2>
          <p>
            While we don't anticipate significant changes to this privacy policy (since we don't
            collect data), any updates will be reflected in the "Last updated" date above.
          </p>
        </section>
      </div>
    </main>
  );
} 