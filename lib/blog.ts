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
  coverCredit?: {
    name: string;
    url: string;
  };
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
  {
    id: "best-place-used-products",
    publishedAt: "2026-09-07",
    updatedAt: "2026-09-07",
    cover: "/blog/buy-sell-used-products.jpg",
    coverCredit: {
      name: "Suzy Hazelwood",
      url: "https://www.pexels.com/photo/merchandise-on-the-sidewalk-in-front-of-an-antique-shop-5915002/",
    },
    en: {
      slug: "best-place-to-buy-and-sell-used-or-second-hand-products",
      title: "Best place to buy and sell used or second hand products",
      description:
        "A simple guide to buying and selling used products safely in Bangladesh, with practical tips for prices, photos, product checks, and choosing a marketplace.",
      excerpt:
        "A good second hand deal starts with clear information, a fair price, and a place where buyers and sellers can talk without wasting each other's time.",
    },
    bn: {
      slug: "byabohrito-ba-second-hand-ponno-kena-bechar-sera-jayga",
      title: "ব্যবহৃত বা সেকেন্ড হ্যান্ড পণ্য কেনাবেচার সেরা জায়গা",
      description:
        "বাংলাদেশে নিরাপদে ব্যবহৃত পণ্য কেনাবেচার সহজ গাইড। সঠিক দাম, ভালো ছবি, পণ্য যাচাই এবং মার্কেটপ্লেস বাছাইয়ের বাস্তব পরামর্শ।",
      excerpt:
        "ভালো সেকেন্ড হ্যান্ড ডিলের জন্য দরকার পরিষ্কার তথ্য, ন্যায্য দাম এবং এমন একটি জায়গা যেখানে ক্রেতা ও বিক্রেতা সহজে কথা বলতে পারেন।",
    },
  },
  {
    id: "world-used-products-market",
    publishedAt: "2026-09-07",
    updatedAt: "2026-09-07",
    cover: "/blog/world-used-products-market.jpg",
    coverCredit: {
      name: "Jahra Tasfia Reza",
      url: "https://www.pexels.com/photo/busy-outdoor-market-with-electronics-and-diverse-vendors-34629890/",
    },
    en: {
      slug: "current-world-market-for-used-products",
      title: "Current world market for used products",
      description:
        "A plain-language look at the global used products market, including second hand phones, clothing, furniture, repair, resale platforms, and changing buyer habits.",
      excerpt:
        "Used products have moved into everyday shopping. Phones, clothes, furniture, and collectibles are changing hands through global platforms and local marketplaces.",
    },
    bn: {
      slug: "byabohrito-ponner-bortoman-bissho-bazar",
      title: "ব্যবহৃত পণ্যের বর্তমান বিশ্ববাজার",
      description:
        "সেকেন্ড হ্যান্ড ফোন, পোশাক, আসবাব, মেরামত, রিসেল প্ল্যাটফর্ম এবং ক্রেতাদের বদলে যাওয়া অভ্যাস নিয়ে বিশ্ববাজারের সহজ আলোচনা।",
      excerpt:
        "ব্যবহৃত পণ্য এখন দৈনন্দিন কেনাকাটার অংশ। ফোন, পোশাক, আসবাব ও সংগ্রহের জিনিস বিশ্বজুড়ে নতুন মালিক খুঁজে পাচ্ছে।",
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
