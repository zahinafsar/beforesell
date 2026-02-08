import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

interface BikroyListing {
  url: string;
  adId: string;
  slug: string;
  title: string;
  price: number | null;
  currency: string;
  description: string;
  location: {
    area: string | null;
    city: string | null;
  };
  category: {
    id: number;
    name: string;
    parentName: string | null;
  } | null;
  attributes: Record<string, string>;
  seller: {
    name: string | null;
    phone: string | null;
    memberSince: string | null;
    membershipLevel: string;
  };
  images: string[];
  postedDate: string | null;
  views: number | null;
  type: string;
  scrapedAt: string;
}

interface AdProperty {
  label: string;
  value: string;
  key: string;
  value_key?: string;
}

interface InitialData {
  adDetail?: {
    type: string;
    data?: {
      ad?: {
        id: string;
        slug: string;
        title: string;
        description: string;
        type: string;
        money?: { amount: string };
        properties?: AdProperty[];
        location?: {
          name: string;
          parent?: { name: string };
        };
        category?: {
          id: number;
          name: string;
          parent?: { name: string };
        };
        contactCard?: {
          name: string;
          phoneNumbers?: Array<{ number: string }>;
        };
        membershipLevel?: string;
        memberSince?: string;
        adDate?: string;
        images?: {
          meta?: Array<{ src: string }>;
        };
        statistics?: { views: number };
      };
    };
  };
}

function extractInitialData(html: string): InitialData | null {
  const match = html.match(
    /window\.initialData\s*=\s*(\{[\s\S]*?\});?\s*<\/script>/
  );
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

async function scrapeBikroyListing(url: string): Promise<BikroyListing> {
  console.log(`Fetching: ${url}`);

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch: ${response.status} ${response.statusText}`
    );
  }

  const html = await response.text();
  const initialData = extractInitialData(html);
  const ad = initialData?.adDetail?.data?.ad;

  if (!ad) {
    throw new Error("Could not extract ad data from page");
  }

  // Price
  let price: number | null = null;
  if (ad.money?.amount) {
    const priceMatch = ad.money.amount.replace(/,/g, "").match(/[\d.]+/);
    price = priceMatch ? parseFloat(priceMatch[0]) : null;
  }

  // Attributes from properties array
  const attributes: Record<string, string> = {};
  if (ad.properties) {
    for (const prop of ad.properties) {
      attributes[prop.label] = prop.value;
    }
  }

  // Images - construct full URLs from meta
  const images: string[] = [];
  if (ad.images?.meta) {
    for (const img of ad.images.meta) {
      images.push(`${img.src}/1200/630/fitted.jpg`);
    }
  }

  return {
    url,
    adId: ad.id,
    slug: ad.slug,
    title: ad.title,
    price,
    currency: "BDT",
    description: ad.description,
    location: {
      area: ad.location?.name || null,
      city: ad.location?.parent?.name || null,
    },
    category: ad.category
      ? {
          id: ad.category.id,
          name: ad.category.name,
          parentName: ad.category.parent?.name || null,
        }
      : null,
    attributes,
    seller: {
      name: ad.contactCard?.name || null,
      phone: ad.contactCard?.phoneNumbers?.[0]?.number || null,
      memberSince: ad.memberSince || null,
      membershipLevel: ad.membershipLevel || "free",
    },
    images,
    postedDate: ad.adDate || null,
    views: ad.statistics?.views ?? null,
    type: ad.type || "for_sale",
    scrapedAt: new Date().toISOString(),
  };
}

async function main() {
  const url = process.argv[2];

  try {
    const data = await scrapeBikroyListing(url);

    const outputDir = join(process.cwd(), "temp");
    mkdirSync(outputDir, { recursive: true });

    const filename = data.slug || "listing";
    const outputPath = join(outputDir, `${filename}.json`);

    writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`\nSaved to: ${outputPath}`);
    console.log("\nExtracted data:");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
