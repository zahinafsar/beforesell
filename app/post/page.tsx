import { Metadata } from "next";
import Link from "next/link";
import { PackageSearch, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Post an Ad",
  description: "Sell your product or tell sellers what you want to buy on BeforeSell.",
};

const options = [
  {
    href: "/listings/new",
    icon: Tag,
    title: "Post to sell your product",
    description: "Add photos, set your price and reach buyers across Bangladesh.",
  },
  {
    href: "/requests/new",
    icon: PackageSearch,
    title: "Post to buy a product",
    description: "Describe what you need and your budget, then share the link so sellers can message you.",
  },
];

export default function PostPage() {
  return (
    <div className="container max-w-3xl px-4 py-10 sm:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">What would you like to do?</h1>
        <p className="mt-2 text-muted-foreground">Choose the type of ad you want to post.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {options.map((option) => (
          <Link key={option.href} href={option.href} className="group">
            <Card className="h-full transition-colors group-hover:border-primary group-hover:bg-primary/5">
              <CardContent className="flex h-full flex-col items-center gap-4 p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <option.icon className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-semibold">{option.title}</h2>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
