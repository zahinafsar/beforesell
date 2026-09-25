import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import Link from "next/link";
import { UserPlus, Camera, MessageCircle, HandshakeIcon, PackageSearch, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = generatePageMetadata({
  title: "How to Buy and Sell",
  description: "Learn how to buy and sell on BeforeSell: post a free ad, request a product you want to buy, message each other and arrange a deal.",
  path: "/how-it-works",
});

const steps = [
  {
    icon: UserPlus,
    step: "1",
    title: "Create an Account",
    description: "Sign up for free with your email address. It only takes a minute to get started.",
  },
  {
    icon: Camera,
    step: "2",
    title: "Post Your Ad",
    description:
      "Take photos, write a description, set your price, and publish your ad for free. It goes live instantly.",
  },
  {
    icon: MessageCircle,
    step: "3",
    title: "Connect with Buyers",
    description:
      "Interested buyers will message you directly. Chat safely through our built-in messaging system.",
  },
  {
    icon: HandshakeIcon,
    step: "4",
    title: "Make the Deal",
    description:
      "Meet the buyer, finalize the deal, and complete the transaction. It's that simple!",
  },
];

const buyerSteps = [
  {
    step: "1",
    title: "Search & Browse",
    description: "Use our search or browse categories to find exactly what you're looking for.",
  },
  {
    step: "2",
    title: "Contact the Seller",
    description: "Found something you like? Send the seller a message to ask questions or negotiate.",
  },
  {
    step: "3",
    title: "Meet & Buy",
    description: "Arrange a meetup, inspect the item, and complete the purchase safely.",
  },
];

const requestSteps = [
  {
    icon: PackageSearch,
    step: "1",
    title: "Post a Request",
    description: "Tell us what you want to buy, your budget and your location. Posting a request is free.",
  },
  {
    icon: Share2,
    step: "2",
    title: "Share or Boost It",
    description: "Share the request link anywhere, or boost it so the right sellers see it.",
  },
  {
    icon: MessageCircle,
    step: "3",
    title: "Sellers Message You",
    description: "Sellers who have the product tap \"I have this\" and chat with you on BeforeSell.",
  },
  {
    icon: HandshakeIcon,
    step: "4",
    title: "Inspect & Buy",
    description: "Meet the seller, check the item and pay only when you are happy with it.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container px-4 py-12 max-w-4xl mx-auto">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-3xl md:text-4xl font-bold">How It Works</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Post a basic ad for free, request a product you can&apos;t find, contact buyers or sellers, and arrange a deal directly. Optional boosts are paid.
        </p>
      </div>

      {/* Selling Steps */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Selling on BeforeSell</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((item) => (
            <div key={item.step} className="flex gap-4 p-6 rounded-lg border bg-card">
              <div className="h-12 w-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-xs font-medium text-primary mb-1">Step {item.step}</div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button variant="outline" asChild>
            <Link href="/listings/new">Sell a Product</Link>
          </Button>
        </div>
      </div>

      {/* Buying Steps */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Buying on BeforeSell</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {buyerSteps.map((item) => (
            <div key={item.step} className="text-center p-6 rounded-lg border bg-card">
              <div className="h-10 w-10 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-2 text-center">Can&apos;t Find It? Request It</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
          If nobody has listed what you want yet, post a buyer request and let sellers come to you.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requestSteps.map((item) => (
            <div key={item.step} className="flex gap-4 p-6 rounded-lg border bg-card">
              <div className="h-12 w-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-xs font-medium text-primary mb-1">Step {item.step}</div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button variant="outline" asChild>
            <Link href="/requests/new">Request a Product</Link>
          </Button>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center p-8 rounded-lg bg-primary text-primary-foreground">
        <h2 className="text-xl font-semibold mb-2">Ready to Get Started?</h2>
        <p className="text-primary-foreground/80 mb-4">Post an ad to sell or a request to buy. Both are free!</p>
        <Button variant="secondary" size="lg" asChild>
          <Link href="/post">Post Free Ad</Link>
        </Button>
      </div>
    </div>
  );
}
