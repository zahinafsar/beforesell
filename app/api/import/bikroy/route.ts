import { NextResponse } from "next/server";
import { NextApiRequest } from "next-ts-api";
import { getCurrentUser } from "@/lib/auth";

interface ImportBody {
  url: string;
}

interface AdProperty {
  label: string;
  value: string;
  key: string;
}

interface InitialData {
  adDetail?: {
    data?: {
      ad?: {
        id: string;
        title: string;
        description: string;
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
        images?: {
          meta?: Array<{ src: string }>;
        };
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

export async function POST(request: NextApiRequest<ImportBody>) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url || !url.includes("bikroy.com")) {
      return NextResponse.json(
        { error: "Please provide a valid bikroy.com URL" },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: "Failed to fetch listing from Bikroy.com" },
        { status: 502 }
      );
    }

    const html = await response.text();
    const initialData = extractInitialData(html);
    const ad = initialData?.adDetail?.data?.ad;

    if (!ad) {
      return NextResponse.json(
        { error: "Could not extract listing data. The URL may be invalid." },
        { status: 422 }
      );
    }

    let price: number | null = null;
    if (ad.money?.amount) {
      const priceMatch = ad.money.amount.replace(/,/g, "").match(/[\d.]+/);
      price = priceMatch ? parseFloat(priceMatch[0]) : null;
    }

    const attributes: Record<string, string> = {};
    if (ad.properties) {
      for (const prop of ad.properties) {
        attributes[prop.label] = prop.value;
      }
    }

    const images: string[] = [];
    if (ad.images?.meta) {
      for (const img of ad.images.meta) {
        images.push(`${img.src}/1200/630/fitted.jpg`);
      }
    }

    const negotiable = ad.properties?.some(
      (p) =>
        p.key === "negotiable" ||
        (p.label.toLowerCase().includes("negotiable") &&
          p.value.toLowerCase() === "yes")
    ) ?? false;

    const phone = ad.contactCard?.phoneNumbers?.[0]?.number || null;

    return NextResponse.json({
      title: ad.title,
      description: ad.description,
      price,
      negotiable,
      phone,
      attributes,
      images,
      location: {
        area: ad.location?.name || null,
        city: ad.location?.parent?.name || null,
      },
      category: ad.category
        ? {
            name: ad.category.name,
            parentName: ad.category.parent?.name || null,
          }
        : null,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to import listing" },
      { status: 500 }
    );
  }
}
