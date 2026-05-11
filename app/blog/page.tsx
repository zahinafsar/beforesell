import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blog";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Blog",
  description:
    "Stories, comparisons, and tips from the BeforeSell team — Bangladesh's safer marketplace.",
  path: "/blog",
});

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndexPage() {
  return (
    <div className="container px-4 py-12 md:py-16 max-w-4xl mx-auto">
      <header className="mb-12 space-y-3">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary">Blog</h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
          Why we built BeforeSell, how we&apos;re making selling safer in Bangladesh, and lessons from the road.
        </p>
      </header>

      <div className="space-y-6">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.id}
            className="border p-6 md:p-8 bg-card flex flex-col gap-4 hover:border-primary transition-colors"
          >
            <time dateTime={post.publishedAt} className="text-xs uppercase tracking-wider text-muted-foreground">
              {formatDate(post.publishedAt)}
            </time>

            <div className="grid md:grid-cols-2 gap-6">
              <Link
                href={`/en/${post.en.slug}`}
                hrefLang="en"
                className="group space-y-2"
              >
                <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">English</span>
                <h2 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-primary transition-colors">
                  {post.en.title}
                </h2>
                <p className="text-sm text-muted-foreground">{post.en.excerpt}</p>
                <span className="inline-flex items-center gap-1 text-sm text-primary font-medium">
                  Read <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>

              <Link
                href={`/bn/${post.bn.slug}`}
                hrefLang="bn"
                lang="bn"
                className="group space-y-2 md:border-l md:pl-6"
              >
                <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">বাংলা</span>
                <h2 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-primary transition-colors">
                  {post.bn.title}
                </h2>
                <p className="text-sm text-muted-foreground">{post.bn.excerpt}</p>
                <span className="inline-flex items-center gap-1 text-sm text-primary font-medium">
                  পড়ুন <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
