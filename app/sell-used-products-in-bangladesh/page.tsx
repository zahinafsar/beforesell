import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generatePageMetadata, generateBreadcrumbJsonLd, getBaseUrl, serializeJsonLd } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Sell Used Products in Bangladesh",
  description: "Sell second-hand products in Bangladesh on BeforeSell. Learn how to post a free ad, choose an asking price, contact buyers and arrange a safe handover.",
  path: "/sell-used-products-in-bangladesh",
});

const questions = [
  { question: "Can I sell second-hand products on BeforeSell?", answer: "Yes. BeforeSell is a classifieds marketplace in Bangladesh for new and used products. Choose the category that fits your item and describe its condition honestly. Listings must follow the platform's terms and listing rules." },
  { question: "Is posting an ad free?", answer: "Posting a basic ad on BeforeSell is free. Optional listing boosts are paid. A boost promotes an ad; it does not guarantee a sale." },
  { question: "Does BeforeSell buy my product directly?", answer: "BeforeSell connects buyers and sellers. You set your asking price, communicate with interested buyers and agree on payment and handover directly. BeforeSell is not a party to the transaction." },
  { question: "What should I include in a used-product ad?", answer: "Include the brand and model, how long you have used the item, its working condition, defects or repairs, included accessories, asking price and location. Use your own clear photos of the actual item." },
  { question: "How should I receive payment?", answer: "Arrange a handover where the buyer can inspect the item. Confirm cash or a completed transfer in your own bank or mobile-wallet account before handing it over. A screenshot or SMS alone is not proof of payment. Never share an OTP or PIN." },
];

export default function SellUsedProductsPage() {
  const baseUrl = getBaseUrl();
  const breadcrumbs = generateBreadcrumbJsonLd([
    { name: "Home", url: baseUrl },
    { name: "Sell Used Products in Bangladesh", url: `${baseUrl}/sell-used-products-in-bangladesh` },
  ]);

  return (
    <article className="container px-4 py-12 max-w-4xl mx-auto space-y-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbs) }} />
      <header className="space-y-5">
        {/* <Link href="/" className="text-sm text-primary hover:underline">BeforeSell Home</Link> */}
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-primary">Sell Used Products in Bangladesh on BeforeSell</h1>
        <p className="text-lg text-muted-foreground">Have a phone, laptop, piece of furniture or another item you no longer use? BeforeSell lets you post a basic ad for free and connect directly with interested buyers in Bangladesh.</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg"><Link href="/post">Post Free Ad</Link></Button>
          <Button asChild size="lg" variant="outline"><Link href="/categories">Browse Categories</Link></Button>
        </div>
      </header>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">How to Sell Your Second-Hand Item</h2>
        <ol className="list-decimal pl-6 space-y-4 text-muted-foreground">
          <li><strong className="text-foreground">Prepare your item.</strong> Clean it, check that it works and photograph its actual condition. Show scratches, damage and included accessories.</li>
          <li><strong className="text-foreground">Choose an asking price.</strong> Compare similar items in the same category. Account for age, condition, repairs and accessories, and say whether your price is negotiable.</li>
          <li><strong className="text-foreground">Create an account and post an ad.</strong> Choose the relevant category, add a clear title and description, upload photos, and enter your price and location.</li>
          <li><strong className="text-foreground">Talk to interested buyers.</strong> Use BeforeSell messaging to answer questions and agree on the price and a suitable handover location.</li>
          <li><strong className="text-foreground">Complete the handover.</strong> Let the buyer inspect the item and confirm payment yourself. For a phone or laptop, remove personal accounts and erase your data before handing it over. Mark your listing as sold afterward.</li>
        </ol>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Free Ads and Optional Paid Promotion</h2>
        <p className="text-muted-foreground">A basic listing is free. If you choose a paid boost, review the price and duration shown before paying. Neither a free listing nor a boost guarantees buyer interest or a sale.</p>
        <p className="text-muted-foreground">BeforeSell is a classifieds platform. It does not buy your item directly, set the final sale price or guarantee the quality of a listed product. Buyers and sellers arrange their transaction themselves.</p>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Meet and Receive Payment Carefully</h2>
        <p className="text-muted-foreground">Meet in a busy public place when possible. For large items requiring collection, agree on the arrangements in advance and have someone with you. Check payment in your own account before handing over the product, and never disclose your PIN or OTP.</p>
        <Link href="/safety" className="inline-block text-primary hover:underline">Read all buying and selling safety tips</Link>
      </section>
      <section className="space-y-6" aria-labelledby="selling-questions">
        <h2 id="selling-questions" className="text-2xl font-semibold">Common Questions About Selling on BeforeSell</h2>
        {questions.map(({ question, answer }) => (
          <div key={question} className="space-y-2">
            <h3 className="text-lg font-semibold">{question}</h3>
            <p className="text-muted-foreground">{answer}</p>
          </div>
        ))}
      </section>
      <section lang="bn" className="space-y-3 border-t pt-8">
        <h2 className="text-2xl font-semibold">বাংলাদেশে ব্যবহৃত পণ্য বিক্রি করুন</h2>
        <p className="text-muted-foreground">BeforeSell-এ নতুন ও ব্যবহৃত পণ্যের সাধারণ বিজ্ঞাপন বিনামূল্যে পোস্ট করতে পারেন। পণ্যের আসল ছবি, অবস্থা, দাম ও অবস্থান দিন এবং আগ্রহী ক্রেতার সঙ্গে সরাসরি কথা বলুন। ঐচ্ছিক বিজ্ঞাপন বুস্টের জন্য টাকা দিতে হয়।</p>
        <Link href="/bn/byabohrito-ba-second-hand-ponno-kena-bechar-sera-jayga" hrefLang="bn" className="inline-block text-primary hover:underline">ব্যবহৃত পণ্য কেনাবেচার বাংলা গাইড পড়ুন</Link>
      </section>
      <p className="text-sm text-muted-foreground">Need help? <Link href="/contact" className="text-primary hover:underline">Contact BeforeSell</Link>. Read our <Link href="/terms" className="text-primary hover:underline">listing rules and terms</Link> before posting.</p>
    </article>
  );
}
