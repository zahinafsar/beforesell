import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - BeforeSell",
  description: "BeforeSell's terms of service. Read the rules and guidelines for using our platform.",
};

export default function TermsPage() {
  return (
    <div className="container px-4 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">Last updated: February 2026</p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing or using BeforeSell, you agree to be bound by these Terms of Service. If you do not agree
            to these terms, please do not use our platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. User Accounts</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>You must provide accurate and complete information when creating an account</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>You must be at least 18 years old to use BeforeSell</li>
            <li>One person may only create one account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Listing Rules</h2>
          <p className="text-muted-foreground mb-2">When posting listings, you agree to:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Provide accurate descriptions and genuine photos of your items</li>
            <li>Set honest and fair prices</li>
            <li>Not post prohibited items (weapons, drugs, counterfeit goods, stolen property)</li>
            <li>Not post misleading, fraudulent, or spam listings</li>
            <li>Respond to interested buyers in a timely manner</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Prohibited Content</h2>
          <p className="text-muted-foreground">The following are strictly prohibited on BeforeSell:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
            <li>Illegal items or services</li>
            <li>Adult content or services</li>
            <li>Hateful, abusive, or discriminatory content</li>
            <li>Spam, scams, or fraudulent listings</li>
            <li>Copyrighted material without permission</li>
            <li>Personal information of others without consent</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Transactions</h2>
          <p className="text-muted-foreground">
            BeforeSell is a platform that connects buyers and sellers. We are not a party to any transaction between
            users. All transactions are conducted at the users&apos; own risk. We do not guarantee the quality,
            safety, or legality of items listed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Content Ownership</h2>
          <p className="text-muted-foreground">
            You retain ownership of content you post on BeforeSell. By posting, you grant us a non-exclusive license
            to display your content on our platform for the purpose of providing our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Account Termination</h2>
          <p className="text-muted-foreground">
            We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent
            activity, or harm the BeforeSell community. You may also delete your account at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
          <p className="text-muted-foreground">
            BeforeSell is provided &quot;as is&quot; without warranties. We are not liable for any damages arising
            from your use of the platform, including losses from transactions between users.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Changes to Terms</h2>
          <p className="text-muted-foreground">
            We may update these terms from time to time. Continued use of BeforeSell after changes constitutes
            acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
          <p className="text-muted-foreground">
            For questions about these terms, contact us at{" "}
            <a href="mailto:support@beforesell.com" className="text-primary hover:underline">
              support@beforesell.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
