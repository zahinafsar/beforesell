import { Metadata } from "next";
import { Users, Target, Heart, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us - BeforeSell",
  description: "Learn about BeforeSell, Bangladesh's trusted marketplace for buying and selling.",
};

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To make buying and selling accessible to everyone in Bangladesh through a simple, safe, and free platform.",
  },
  {
    icon: Users,
    title: "Community First",
    description:
      "We believe in building a thriving community where buyers and sellers can connect with trust and confidence.",
  },
  {
    icon: Heart,
    title: "Made in Bangladesh",
    description:
      "Built by a Bangladeshi team who understands local needs, culture, and the way people trade.",
  },
  {
    icon: ShieldCheck,
    title: "Safety & Trust",
    description:
      "We prioritize user safety with verified listings, secure messaging, and community guidelines.",
  },
];

export default function AboutPage() {
  return (
    <div className="container px-4 py-12 max-w-4xl mx-auto">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-3xl md:text-4xl font-bold">About BeforeSell</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Bangladesh&apos;s fastest-growing online marketplace connecting millions of buyers and sellers every day.
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none mb-12">
        <p>
          BeforeSell is a classifieds marketplace built for the people of Bangladesh. Whether you&apos;re
          looking to buy a smartphone, sell your car, find a rental apartment, or discover job opportunities
          — BeforeSell makes it easy, fast, and completely free.
        </p>
        <p>
          We started with a simple idea: everyone should have access to a modern, trustworthy platform to
          trade goods and services. Traditional classifieds are outdated, and we&apos;re here to change that
          with a beautiful, user-friendly experience powered by the latest technology.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {values.map((value) => (
          <div key={value.title} className="flex gap-4 p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
              <value.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{value.title}</h3>
              <p className="text-sm text-muted-foreground">{value.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center p-8 rounded-lg bg-muted/50">
        <h2 className="text-xl font-semibold mb-2">Have Questions?</h2>
        <p className="text-muted-foreground">
          Reach out to us at{" "}
          <a href="mailto:support@beforesell.com" className="text-primary hover:underline">
            support@beforesell.com
          </a>
        </p>
      </div>
    </div>
  );
}
