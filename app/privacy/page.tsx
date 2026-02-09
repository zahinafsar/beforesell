import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - BeforeSell",
  description: "BeforeSell's privacy policy. Learn how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="container px-4 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: February 2026</p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
          <p className="text-muted-foreground mb-2">
            When you use BeforeSell, we may collect the following information:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Account information (name, email, phone number)</li>
            <li>Listing details (title, description, images, price, location)</li>
            <li>Messages exchanged between users</li>
            <li>Device and browser information for analytics</li>
            <li>Location data (division and district) for listing purposes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>To provide and improve our marketplace services</li>
            <li>To display your listings to potential buyers</li>
            <li>To facilitate communication between buyers and sellers</li>
            <li>To send important account and service notifications</li>
            <li>To prevent fraud and ensure platform safety</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
          <p className="text-muted-foreground">
            We do not sell your personal information to third parties. Your information may be shared only in the
            following cases:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
            <li>Public listing information visible to all users</li>
            <li>With service providers who help us operate the platform</li>
            <li>When required by law or to protect our legal rights</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
          <p className="text-muted-foreground">
            We implement appropriate security measures to protect your personal information, including encrypted
            connections, secure authentication, and regular security audits. However, no method of transmission over
            the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Cookies</h2>
          <p className="text-muted-foreground">
            We use essential cookies to keep you logged in and provide core functionality. We may also use analytics
            cookies to understand how users interact with our platform and improve the experience.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
          <p className="text-muted-foreground">You have the right to:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
            <li>Access and update your personal information</li>
            <li>Delete your account and associated data</li>
            <li>Opt out of non-essential communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
          <p className="text-muted-foreground">
            For privacy-related questions, contact us at{" "}
            <a href="mailto:help.beforesell@gmail.com" className="text-primary hover:underline">
              help.beforesell@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
