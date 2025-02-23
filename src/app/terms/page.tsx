import { PROJECT_NAME } from '@/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Terms of Service | ${PROJECT_NAME}`,
  description: `Terms of service and conditions for using ${PROJECT_NAME}.`,
};

export default function TermsOfService() {
  return (
    <main className="container mx-auto px-3 py-6 max-w-3xl">
      <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 p-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Terms of Service</h1>
        <div className="prose dark:prose-invert max-w-none text-sm">
          <p className="text-base mb-4 text-gray-600 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-6">
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <span className="text-base">👋</span> Welcome
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Thank you for visiting {PROJECT_NAME}. This is an independent project created to help
              professionals optimize their vacation days. While I aim to keep the service straightforward,
              these terms outline the guidelines that help ensure a positive experience for everyone.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <span className="text-base">🎯</span> Service Overview
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {PROJECT_NAME} is a tool designed to help you plan your time off more effectively.
              The service analyzes your available holiday dates, integrates with external APIs for holiday and weather data,
              and suggests optimal combinations to maximize your time off. Your preferences and planning data are stored
              locally on your device for a seamless experience.
            </p>
            <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
              Note: Service availability depends on both our application and our external API providers.
              While we strive for reliability, service interruptions may occur.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <span className="text-base">🤝</span> Terms of Use
            </h2>
            <p className="text-gray-600 dark:text-gray-400">By using {PROJECT_NAME}, you agree to:</p>
            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-gray-600 dark:text-gray-400">
              <li>Use the service for personal holiday planning purposes</li>
              <li>Allow the application to store your preferences and planning data locally</li>
              <li>Accept our use of external APIs to enhance the service</li>
              <li>Respect the system&apos;s security and integrity</li>
              <li>Acknowledge usage limitations based on API quotas and restrictions</li>
              <li>Accept that features and functionality may evolve over time</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <span className="text-base">💾</span> Data Storage & API Usage
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              To provide you with the best possible experience, {PROJECT_NAME}:
            </p>
            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-gray-600 dark:text-gray-400">
              <li>Stores your preferences and planning data in your browser&apos;s local storage</li>
              <li>Uses your browser&apos;s Geolocation API to detect your location (with permission)</li>
              <li>Uses Nager.Date API for retrieving public holiday information</li>
              <li>Utilizes BigDataCloud API for location and timezone data</li>
              <li>May be subject to API rate limits from these service providers</li>
              <li>Processes and stores data in accordance with our Privacy Policy</li>
            </ul>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Our service integrations:
            </p>
            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-gray-600 dark:text-gray-400">
              <li><strong>Browser Geolocation:</strong> Requests permission to access your current location</li>
              <li><strong>Nager.Date API:</strong> Provides public holiday data for different countries</li>
              <li><strong>BigDataCloud API:</strong> Provides geolocation and timezone services</li>
            </ul>
            <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
              Service availability and functionality depend on these features and third-party providers.
              You can clear your stored data at any time through your browser settings.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <span className="text-base">🎨</span> Development & Attribution
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {PROJECT_NAME} was developed using modern tools and practices, including significant
              contributions from Cursor AI&apos;s pair programming capabilities. While the development process
              leveraged AI assistance, all final decisions and responsibility for the service rest with
              the project maintainer. Users are welcome to use and enjoy the service, but redistribution
              or copying is not permitted.
            </p>
            <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
              This project demonstrates the potential of human-AI collaboration in modern software development,
              showcasing responsible and innovative use of AI assistance. 🤖
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <span className="text-base">⚠️</span> Liability & Limitations
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {PROJECT_NAME} is provided &ldquo;as is&rdquo; without warranties of any kind, either express or implied.
              While we implement reasonable precautions and best practices, we cannot accept liability for:
            </p>
            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-gray-600 dark:text-gray-400">
              <li>Accuracy of browser-provided location data</li>
              <li>Accuracy of holiday data provided by Nager.Date API</li>
              <li>Accuracy of location data provided by BigDataCloud API</li>
              <li>Service interruptions or technical issues from our API providers</li>
              <li>Decisions made based on the tool&apos;s recommendations</li>
              <li>Any consequential impacts on your holiday planning</li>
            </ul>
            <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
              Users are advised to verify all important dates and decisions with their employers
              and official calendars. Service availability and accuracy depend on browser features and third-party providers.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <span className="text-base">🔄</span> Updates & Modifications
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              As an evolving project, {PROJECT_NAME} may undergo periodic updates and improvements.
              I reserve the right to modify or update these terms and the service&apos;s functionality.
              Users are encouraged to periodically review these terms for any changes.
            </p>
          </section>

          <section className="mb-0">
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <span className="text-base">📬</span> Contact & Support
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              This is an open-source side project without dedicated support channels.
              For issues, feature requests, or contributions, please visit the project&apos;s
              GitHub repository.
            </p>
            <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
              As this is a personal side project, support and updates are provided on a
              best-effort basis.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
} 