import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  type BlogPost,
  type BlogLang,
  getPostUrl,
  getAlternateLang,
} from "@/lib/blog";
import { generateBlogJsonLd } from "@/lib/seo";

interface BlogLayoutProps {
  post: BlogPost;
  lang: BlogLang;
  children: React.ReactNode;
}

const T = {
  en: {
    home: "Home",
    blog: "Blog",
    publishedOn: "Published",
    readInOther: "বাংলায় পড়ুন",
    backToBlog: "Back to all posts",
  },
  bn: {
    home: "হোম",
    blog: "ব্লগ",
    publishedOn: "প্রকাশিত",
    readInOther: "Read in English",
    backToBlog: "সব পোস্টে ফিরে যান",
  },
} as const;

function formatDate(iso: string, lang: BlogLang): string {
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function BlogLayout({ post, lang, children }: BlogLayoutProps) {
  const t = T[lang];
  const content = post[lang];
  const altLang = getAlternateLang(lang);
  const altUrl = getPostUrl(post, altLang);
  const jsonLd = generateBlogJsonLd({ post, lang });

  return (
    <article lang={lang === "bn" ? "bn" : "en"} className="container px-4 py-10 md:py-16 max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">
          {t.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/blog" className="hover:text-foreground transition-colors">
          {t.blog}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground line-clamp-1">{content.title}</span>
      </nav>

      <header className="mb-10 space-y-4">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-primary leading-tight">
          {content.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <time dateTime={post.publishedAt}>
            {t.publishedOn} · {formatDate(post.publishedAt, lang)}
          </time>
          <Link
            href={altUrl}
            hrefLang={altLang}
            className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
          >
            {t.readInOther}
          </Link>
        </div>
      </header>

      <div
        className={[
          "text-base leading-relaxed text-foreground/90",
          "[&_h2]:text-2xl md:[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-primary [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:leading-tight",
          "[&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-primary [&_h3]:mt-8 [&_h3]:mb-3",
          "[&_p]:my-5",
          "[&_.lead]:text-lg [&_.lead]:text-foreground [&_.lead]:font-medium",
          "[&_a]:text-primary [&_a]:font-medium hover:[&_a]:underline",
          "[&_strong]:font-semibold [&_strong]:text-foreground",
          "[&_em]:italic",
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-5 [&_ul]:space-y-1",
          "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-5 [&_ol]:space-y-1",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-6",
        ].join(" ")}
      >
        {children}
      </div>

      <footer className="mt-16 pt-8 border-t">
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline">
          ← {t.backToBlog}
        </Link>
      </footer>
    </article>
  );
}
