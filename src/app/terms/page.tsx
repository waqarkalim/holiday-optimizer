import { PROJECT_NAME } from '@/constants';
import { Metadata } from 'next';
import { PageLayout, PageHeader, PageTitle, PageDescription, PageContent } from '@/components/layout/PageLayout';

export const metadata: Metadata = {
  title: `Terms of Service | ${PROJECT_NAME}`,
  description: `Terms of service and conditions for using ${PROJECT_NAME}.`,
};

export default function TermsOfService() {
  const lastUpdated = 'April 19, 2025'
  return (
    <PageLayout>
      <PageHeader>
        <PageTitle>Terms of Service</PageTitle>
        <PageDescription>
          Terms of service and conditions for using {PROJECT_NAME}
        </PageDescription>
      </PageHeader>

      <PageContent>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 p-6">
            <div className="prose dark:prose-invert max-w-none text-sm">
              <p className="text-base mb-4 text-gray-600 dark:text-gray-400">Last updated: {lastUpdated}</p>

              <section className="mb-6">
                <h2 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <span className="text-base">👋</span> Welcome
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Thank you for visiting {PROJECT_NAME}. This is an independent project created to help
                  professionals optimize their vacation days. While the service is intended to be straightforward,
                  these terms outline the guidelines that help ensure a positive experience for everyone.
                </p>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  <strong>Important:</strong> {PROJECT_NAME} is a fun side project created primarily for educational purposes.
                  It is not a professional service, and all suggestions should be thoroughly verified with official sources
                  before making any decisions based on the information provided.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <span className="text-base">🎯</span> Service Overview
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {PROJECT_NAME} is a tool designed to help plan time off more effectively.
                  The service analyzes available holiday dates, integrates with external APIs for holiday data,
                  and suggests optimal combinations to maximize time off. Preferences and planning data are stored
                  locally on your device for a seamless experience.
                </p>
                <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
                  Note: Service availability depends on both the application and external API providers.
                  While reliability is prioritized, service interruptions may occur.
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
                  <li>Accept the use of external APIs to enhance the service</li>
                  <li>Respect the system&apos;s security and integrity</li>
                  <li>Acknowledge usage limitations based on API quotas and restrictions</li>
                  <li>Accept that features and functionality may evolve over time</li>
                  <li>Verify all suggestions with official sources before making decisions</li>
                  <li>Take full responsibility for any decisions made based on the tool&apos;s outputs</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <span className="text-base">💾</span> Data Storage & API Usage
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  To provide the best possible experience, {PROJECT_NAME} utilizes:
                </p>
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-gray-600 dark:text-gray-400">
                  <li>Your browser&apos;s local storage for preferences and planning data</li>
                  <li>External APIs for holiday data and other features</li>
                  <li>Analytics for understanding application usage patterns</li>
                </ul>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Third-party services used by the application include:
                </p>
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-gray-600 dark:text-gray-400">
                  <li><strong>date-holidays package</strong> - For holiday data</li>
                  <li><strong>Umami Analytics</strong> - For anonymous usage statistics</li>
                  <li><strong>Cloudflare Pages</strong> - For website hosting</li>
                  <li><strong>Cloudflare Analytics</strong> - For basic site performance and usage metrics</li>
                  <li><strong>Google AdSense</strong> - For displaying advertisements</li>
                </ul>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Each of these services has its own terms of service and privacy policies. By using {PROJECT_NAME}, 
                  you also agree to be bound by the applicable terms of these third-party services when their 
                  functionality is used within the application.
                </p>
                <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
                  Service availability and functionality depend on these features and third-party providers.
                  Locally stored data can be cleared at any time through your browser settings.
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
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  This project was created as a fun side project meant primarily for educational purposes
                  and to demonstrate practical applications of modern web development techniques.
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
                  While reasonable precautions and best practices are implemented, no liability can be accepted for:
                </p>
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-gray-600 dark:text-gray-400">
                  <li>Accuracy of data provided by external APIs or services</li>
                  <li>Service interruptions or technical issues from API providers</li>
                  <li>Decisions made based on the tool&apos;s recommendations</li>
                  <li>Any consequential impacts on your holiday planning</li>
                  <li>Changes in third-party service policies or availability</li>
                  <li>Any direct, indirect, incidental, or consequential damages arising from use of the service</li>
                  <li>Content or advertisements displayed through third-party services like Google AdSense</li>
                </ul>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  <strong>Due Diligence Required:</strong> As {PROJECT_NAME} is an educational side project, users are explicitly 
                  required to perform their own due diligence before making any decisions based on the information provided. 
                  This includes verifying all holiday dates, regional policies, and company-specific requirements with official sources.
                </p>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  <strong>Disclaimer of Liability:</strong> By using this service, you acknowledge that the creator accepts no liability 
                  whatsoever for any outcomes resulting from your use of this tool. All suggestions, calculations, and optimizations 
                  are provided for informational and educational purposes only.
                </p>
                <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
                  Users are advised to verify all important dates and decisions with their employers
                  and official calendars. Service availability and accuracy depend on browser features and third-party providers.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <span className="text-base">🔍</span> Holiday Data Accuracy
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {PROJECT_NAME} provides holiday information sourced from third-party libraries and services. 
                  While the data is maintained with care, holidays may vary by region, change yearly, or be affected by special circumstances.
                  Your employer&apos;s policy may also differ from official calendars.
                </p>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  It&apos;s recommended to verify all holiday information with official government sources, your employer,
                  or other authoritative references before making any travel arrangements or planning time off.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-lg font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <span className="text-base">🔄</span> Updates & Modifications
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  As an evolving project, {PROJECT_NAME} may undergo periodic updates and improvements.
                  The right to modify or update these terms and the service&apos;s functionality is reserved.
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
        </div>
      </PageContent>
    </PageLayout>
  );
}
