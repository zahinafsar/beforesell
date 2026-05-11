import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

if (!PEXELS_API_KEY) {
  console.error("Missing PEXELS_API_KEY in env");
  process.exit(1);
}

const queryOverrides: Record<string, string> = {
  electronics: "electronics gadgets",
  vehicles: "car vehicle",
  property: "real estate house",
  jobs: "office work",
  fashion: "fashion clothing",
  pets: "pet dog cat",
  "home-living": "home interior furniture",
  "hobbies-sports": "sports hobby",
  business: "business industry",
  education: "education books",
  services: "service workshop",
  agriculture: "agriculture farm",
  essentials: "grocery essentials",
};

async function pexelsSearch(query: string): Promise<string | null> {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
    query
  )}&per_page=1&orientation=landscape`;
  const res = await fetch(url, {
    headers: { Authorization: PEXELS_API_KEY! },
  });
  if (!res.ok) {
    console.error(`Pexels fetch failed for "${query}":`, res.status);
    return null;
  }
  const data = (await res.json()) as {
    photos: { src: { landscape: string; large: string } }[];
  };
  const photo = data.photos[0];
  return photo?.src.landscape || photo?.src.large || null;
}

async function main() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
  });
  console.log(`Found ${categories.length} root categories`);

  for (const cat of categories) {
    const query = queryOverrides[cat.slug] || cat.name;
    const imageUrl = await pexelsSearch(query);
    if (!imageUrl) {
      console.warn(`No image for ${cat.name} (${cat.slug})`);
      continue;
    }
    await prisma.category.update({
      where: { id: cat.id },
      data: { image: imageUrl },
    });
    console.log(`✓ ${cat.name} → ${imageUrl}`);
    await new Promise((r) => setTimeout(r, 300));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
