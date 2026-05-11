export type BlogLang = "en" | "bn";

export interface BlogPostLangContent {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
}

export interface BlogPost {
  id: string;
  publishedAt: string;
  updatedAt: string;
  cover?: string;
  en: BlogPostLangContent;
  bn: BlogPostLangContent;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "why-prefer-beforesell",
    publishedAt: "2026-05-12",
    updatedAt: "2026-05-12",
    en: {
      slug: "why-people-prefer-beforesell-over-bikroy",
      title: "Why People Prefer BeforeSell Over Bikroy.com",
      description:
        "A practical comparison of BeforeSell and Bikroy.com — pricing, listing limits, user experience, and why Bangladeshi buyers and sellers are switching.",
      excerpt:
        "From free unlimited listings to cleaner search and faster messaging — here is why thousands of Bangladeshis are choosing BeforeSell over Bikroy.com.",
    },
    bn: {
      slug: "keno-manush-bikroy-er-cheye-beforesell-ke-pochondo-kore",
      title: "মানুষ কেন Bikroy.com-এর চেয়ে BeforeSell পছন্দ করে",
      description:
        "BeforeSell এবং Bikroy.com-এর বাস্তব তুলনা — দাম, লিস্টিং সীমা, ব্যবহারকারীর অভিজ্ঞতা এবং কেন বাংলাদেশি ক্রেতা-বিক্রেতারা পরিবর্তন করছেন।",
      excerpt:
        "ফ্রি আনলিমিটেড লিস্টিং থেকে শুরু করে পরিষ্কার সার্চ এবং দ্রুত মেসেজিং — কেন হাজার হাজার বাংলাদেশি BeforeSell বেছে নিচ্ছেন।",
    },
  },
];

export function getPost(id: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.id === id);
}

export function getPostByLangSlug(lang: BlogLang, slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p[lang].slug === slug);
}

export function getPostUrl(post: BlogPost, lang: BlogLang): string {
  return `/${lang}/${post[lang].slug}`;
}

export function getAlternateLang(lang: BlogLang): BlogLang {
  return lang === "en" ? "bn" : "en";
}
