import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terms of Service | CTO Planner",
  description: "Terms of service and conditions for using CTO Planner.",
};

export default function TermsOfService() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">👋 Welcome</h2>
          <p>
            Thank you for visiting CTO Planner. This is an independent project created to help
            professionals optimize their vacation days. While I aim to keep the service straightforward,
            these terms outline the guidelines that help ensure a positive experience for everyone.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">🎯 Service Overview</h2>
          <p>
            CTO Planner is a tool designed to help you plan your time off more effectively.
            The service analyzes your available holiday dates and suggests optimal combinations
            to maximize your time off. Simple, focused, and practical.
          </p>
          <p className="mt-4 text-sm italic">
            Note: As an independent project, service availability and features may vary.
            I strive for reliability but cannot guarantee uninterrupted service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">🤝 Terms of Use</h2>
          <p>By using CTO Planner, you agree to:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Use the service for personal holiday planning purposes</li>
            <li>Respect the system&apos;s security and integrity</li>
            <li>Acknowledge this is an independent project with limited resources</li>
            <li>Accept that features and functionality may evolve over time</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">🎨 Development & Attribution</h2>
          <p>
            CTO Planner was developed using modern tools and practices, including significant
            contributions from Cursor AI&apos;s pair programming capabilities. While the development process
            leveraged AI assistance, all final decisions and responsibility for the service rest with
            the project maintainer. Users are welcome to use and enjoy the service, but redistribution
            or copying is not permitted.
          </p>
          <p className="mt-4 text-sm italic">
            This project demonstrates the potential of human-AI collaboration in modern software development,
            showcasing responsible and innovative use of AI assistance. 🤖
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">⚠️ Liability & Limitations</h2>
          <p>
            CTO Planner is provided &ldquo;as is&rdquo; without warranties of any kind, either express or implied.
            While I implement reasonable precautions and best practices, I cannot accept liability for:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Accuracy of holiday planning suggestions</li>
            <li>Service interruptions or technical issues</li>
            <li>Decisions made based on the tool&apos;s recommendations</li>
            <li>Any consequential impacts on your holiday planning</li>
          </ul>
          <p className="mt-4 text-sm italic">
            Users are advised to verify all important dates and decisions with their employers
            and official calendars.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">🔄 Updates & Modifications</h2>
          <p>
            As an evolving project, CTO Planner may undergo periodic updates and improvements.
            I reserve the right to modify or update these terms and the service&apos;s functionality.
            Users are encouraged to periodically review these terms for any changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">📬 Contact & Support</h2>
          <p>
            This is an open-source side project without dedicated support channels.
            For issues, feature requests, or contributions, please visit the project&apos;s
            GitHub repository.
          </p>
          <p className="mt-4 text-sm italic">
            As this is a personal side project, support and updates are provided on a
            best-effort basis.
          </p>
        </section>
      </div>
    </main>
  );
} 