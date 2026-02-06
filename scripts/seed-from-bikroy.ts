import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

function extractInitialData(html: string) {
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

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now().toString(36)
  );
}

async function discoverListingUrls(page: number): Promise<string[]> {
  const url = `https://bikroy.com/en/ads/bangladesh?sort=date&order=desc&buy_now=0&urgent=0&page=${page}`;
  console.log(`Fetching page ${page}: ${url}`);
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) throw new Error(`Failed to fetch listing page: ${response.status}`);

  const html = await response.text();
  const data = extractInitialData(html);
  const ads = data?.serp?.ads?.data?.ads || [];

  const urls: string[] = [];
  for (const ad of ads) {
    if (ad.slug) {
      urls.push(`https://bikroy.com/en/ad/${ad.slug}`);
    }
  }

  if (urls.length === 0) {
    const linkRegex = /href="\/en\/ad\/([^"]+)"/g;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const foundUrl = `https://bikroy.com/en/ad/${match[1]}`;
      if (!urls.includes(foundUrl)) urls.push(foundUrl);
    }
  }

  console.log(`Found ${urls.length} listings on page ${page}`);
  return urls;
}

async function scrapeListing(url: string) {
  console.log(`  Scraping: ${url}`);
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);

  const html = await response.text();
  const data = extractInitialData(html);
  const ad = data?.adDetail?.data?.ad;
  if (!ad) throw new Error(`Could not extract ad data from ${url}`);

  let price = 0;
  if (ad.money?.amount) {
    const priceMatch = ad.money.amount.replace(/,/g, "").match(/[\d.]+/);
    price = priceMatch ? parseFloat(priceMatch[0]) : 0;
  }

  let negotiable = true;
  if (ad.properties) {
    for (const prop of ad.properties) {
      if (prop.key === "price_type" && prop.value_key === "fixed") {
        negotiable = false;
      }
    }
  }

  const images: string[] = [];
  if (ad.images?.meta) {
    for (const img of ad.images.meta) {
      images.push(`${img.src}/1200/630/fitted.jpg`);
    }
  }

  const phone = ad.contactCard?.phoneNumbers?.[0]?.number || null;

  return {
    title: ad.title || "Untitled",
    description: ad.description || "No description provided.",
    price,
    negotiable,
    phone,
    images,
  };
}

async function main() {
  const page = parseInt(process.argv[2] || "1", 10);
  if (isNaN(page) || page < 1) {
    console.error("Usage: npx tsx scripts/seed-from-bikroy.ts <page_number>");
    process.exit(1);
  }

  // 1. Create a user
  console.log("\n--- Creating user ---");
  const password = await hash("password123", 10);
  const user = await prisma.user.create({
    data: {
      name: "Bikroy Seller",
      email: `bikroy-seller-${Date.now()}@test.com`,
      password,
      verified: true,
    },
  });
  console.log(`Created user: ${user.name} (${user.email})`);

  // 2. Find Dhaka location
  const dhaka = await prisma.location.findFirst({
    where: { address: { contains: "Dhaka", mode: "insensitive" } },
  });
  if (!dhaka) {
    console.error("Dhaka location not found in database. Run seed first.");
    process.exit(1);
  }
  console.log(`Using location: ${dhaka.address} (${dhaka.id})`);

  // 3. Discover and scrape listings from the page
  console.log(`\n--- Scraping page ${page} ---`);
  const urls = await discoverListingUrls(page);
  let created = 0;
  let skipped = 0;

  for (const url of urls) {
    try {
      const data = await scrapeListing(url);

      const existing = await prisma.listing.findFirst({
        where: { title: data.title },
      });
      if (existing) {
        console.log(`  >> Skipped (duplicate): "${data.title}"`);
        skipped++;
        continue;
      }

      let description = data.description;
      if (description.length < 20) {
        description += " - Imported from Bikroy.com. Contact seller for details.";
      }

      const listing = await prisma.listing.create({
        data: {
          title: data.title,
          slug: generateSlug(data.title),
          description,
          price: data.price,
          negotiable: data.negotiable,
          phone: data.phone,
          status: "ACTIVE",
          userId: user.id,
          locationId: dhaka.id,
          categoryId: null,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          images: {
            create: data.images.map((imgUrl, i) => ({
              url: imgUrl,
              publicId: `bikroy-${Date.now()}-${i}`,
              order: i,
            })),
          },
        },
      });

      created++;
      console.log(`  + Created: "${listing.title}" (${listing.id})`);

      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(`  x Failed: ${url} - ${(err as Error).message}`);
    }
  }

  console.log(`\n--- Done! Created ${created}, skipped ${skipped} for user ${user.email} ---\n`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
