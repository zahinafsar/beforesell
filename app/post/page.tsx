import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Post an Ad",
  description: "Sell your product or tell sellers what you want to buy on BeforeSell.",
};

const options = [
  {
    href: "/listings/new",
    illustration: "/illustrations/post/sell-product.webp",
    title: "Post to sell your product",
    description: "Add photos, set your price and reach buyers across Bangladesh.",
  },
  {
    href: "/requests/new",
    illustration: "/illustrations/post/buy-product.webp",
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
                <Image
                  src={option.illustration}
                  alt=""
                  width={640}
                  height={640}
                  sizes="(min-width: 640px) 320px, calc(100vw - 96px)"
                  className="h-44 w-full object-contain motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03] sm:h-48"
                />
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
