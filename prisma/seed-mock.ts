import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Configuration
const CONFIG = {
  users: 200,
  listingsPerUser: { min: 0, max: 15 },
  imagesPerListing: { min: 1, max: 5 },
  conversationsPerListing: { min: 0, max: 3 },
  messagesPerConversation: { min: 2, max: 10 },
};

// Sample Cloudinary-like image URLs (placeholder images)
const PLACEHOLDER_IMAGES = [
  "https://picsum.photos/seed/{seed}/800/600",
];

function getRandomImage(seed: string): string {
  return PLACEHOLDER_IMAGES[0].replace("{seed}", seed);
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate realistic listing titles based on category
const LISTING_TEMPLATES: Record<string, { titles: string[]; priceRange: [number, number] }> = {
  "mobile-phones": {
    titles: [
      "{brand} {model} - {storage} {condition}",
      "Urgent Sale: {brand} {model} {ram}GB RAM",
      "{brand} {model} with {condition} condition",
      "Like New {brand} {model} - Full Box",
    ],
    priceRange: [8000, 150000],
  },
  laptops: {
    titles: [
      "{brand} {model} - {processor} {ram}GB RAM {storage}",
      "Gaming Laptop {brand} - {gpu}",
      "{brand} Ultrabook {screen}\" Display",
      "Used {brand} Laptop - Great Condition",
    ],
    priceRange: [25000, 250000],
  },
  computers: {
    titles: [
      "Custom Gaming PC - {processor} {gpu}",
      "{brand} Desktop Computer {ram}GB RAM",
      "Office PC - {processor} {storage}",
      "High-End Workstation - {gpu}",
    ],
    priceRange: [20000, 300000],
  },
  tvs: {
    titles: [
      "{brand} {size}\" Smart TV - {resolution}",
      "LED TV {brand} {size} inch",
      "{brand} Android TV {size}\"",
      "4K UHD {brand} Television",
    ],
    priceRange: [15000, 200000],
  },
  cameras: {
    titles: [
      "{brand} {type} Camera - {megapixels}MP",
      "Professional {brand} DSLR with Lens",
      "{brand} Mirrorless Camera Kit",
      "Action Camera {brand} - Waterproof",
    ],
    priceRange: [10000, 300000],
  },
  gaming: {
    titles: [
      "{platform} Console - Like New",
      "{platform} with 2 Controllers",
      "{platform} Game: {game}",
      "Gaming Accessories for {platform}",
    ],
    priceRange: [5000, 80000],
  },
  cars: {
    titles: [
      "{brand} {model} {year} - {mileage}km",
      "Well Maintained {brand} {model}",
      "{brand} {model} - {fuel} {transmission}",
      "Family Car {brand} {model} {year}",
    ],
    priceRange: [300000, 5000000],
  },
  motorcycles: {
    titles: [
      "{brand} {cc}cc - {year} Model",
      "Sports Bike {brand} {cc}cc",
      "{brand} Motorcycle - Low Mileage",
      "Commuter Bike {brand} {year}",
    ],
    priceRange: [50000, 500000],
  },
  bicycles: {
    titles: [
      "{type} Bicycle - {brand}",
      "{brand} Mountain Bike",
      "Road Bike {brand} - Lightweight",
      "Kids Bicycle {brand}",
    ],
    priceRange: [5000, 100000],
  },
  "auto-parts": {
    titles: [
      "{type} for {compatible}",
      "Original {type} - {compatible}",
      "Car Parts: {type}",
      "Spare Parts for {compatible}",
    ],
    priceRange: [500, 50000],
  },
  apartments: {
    titles: [
      "{bedrooms} Bedroom Apartment for {for}",
      "Luxury Flat - {bedrooms} Bed {bathrooms} Bath",
      "{size} sqft Apartment - {furnished}",
      "Ready Apartment {bedrooms}BR {for}",
    ],
    priceRange: [10000, 50000000],
  },
  houses: {
    titles: [
      "{bedrooms} Bedroom House for {for}",
      "Duplex House - {floors} Floors",
      "Family Home {bedrooms}BR {bathrooms}BA",
      "{size} sqft House with Garden",
    ],
    priceRange: [50000, 100000000],
  },
  land: {
    titles: [
      "{size} Katha {type} Land",
      "Plot for Sale - {size} Katha",
      "{type} Land - Prime Location",
      "Ready Plot {size} Katha",
    ],
    priceRange: [500000, 50000000],
  },
  commercial: {
    titles: [
      "{type} for {for} - {size} sqft",
      "Commercial Space {type}",
      "Prime Location {type}",
      "{type} - Ready to Move",
    ],
    priceRange: [20000, 10000000],
  },
};

// Fallback for categories without templates
const DEFAULT_TEMPLATE = {
  titles: [
    "Item for Sale - Good Condition",
    "Quality Product - Best Price",
    "Selling Unused Item",
    "Great Deal - Contact Now",
  ],
  priceRange: [1000, 50000] as [number, number],
};

async function main() {
  console.log("🌱 Starting mock data generation...\n");

  // Get existing data
  const categories = await prisma.category.findMany({
    include: { attributes: true },
  });
  const locations = await prisma.location.findMany();

  if (categories.length === 0 || locations.length === 0) {
    console.error("❌ Please run the main seed first: npx prisma db seed");
    process.exit(1);
  }

  const subcategories = categories.filter((c) => c.parentId !== null);
  console.log(`Found ${subcategories.length} subcategories and ${locations.length} locations\n`);

  // Create users
  console.log(`Creating ${CONFIG.users} users...`);
  const hashedPassword = await bcrypt.hash("password123", 10);
  const users: { id: string; name: string }[] = [];

  for (let i = 0; i < CONFIG.users; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        phone: `01${faker.string.numeric(9)}`,
        verified: Math.random() > 0.2,
        lastSeen: faker.date.recent({ days: 30 }),
        createdAt: faker.date.past({ years: 2 }),
      },
    });
    users.push({ id: user.id, name: user.name });

    if ((i + 1) % 50 === 0) {
      console.log(`  Created ${i + 1}/${CONFIG.users} users`);
    }
  }
  console.log(`✅ Created ${users.length} users\n`);

  // Create listings
  console.log("Creating listings...");
  const listings: { id: string; userId: string; categoryId: string }[] = [];

  for (const user of users) {
    const listingCount = getRandomInt(CONFIG.listingsPerUser.min, CONFIG.listingsPerUser.max);

    for (let i = 0; i < listingCount; i++) {
      const category = getRandomElement(subcategories);
      const location = getRandomElement(locations);
      const template = LISTING_TEMPLATES[category.slug] || DEFAULT_TEMPLATE;

      // Generate title
      let title = getRandomElement(template.titles);
      title = title
        .replace("{brand}", faker.company.name().split(" ")[0])
        .replace("{model}", faker.string.alphanumeric(4).toUpperCase())
        .replace("{storage}", getRandomElement(["64GB", "128GB", "256GB", "512GB"]))
        .replace("{ram}", getRandomElement(["4", "6", "8", "12", "16"]))
        .replace("{condition}", getRandomElement(["New", "Like New", "Good", "Fair"]))
        .replace("{processor}", getRandomElement(["Core i5", "Core i7", "Ryzen 5", "Ryzen 7"]))
        .replace("{gpu}", getRandomElement(["RTX 3060", "RTX 4070", "RX 6700"]))
        .replace("{screen}", getRandomElement(["13", "14", "15", "16"]))
        .replace("{size}", getRandomElement(["32", "43", "50", "55", "65"]))
        .replace("{resolution}", getRandomElement(["Full HD", "4K UHD"]))
        .replace("{type}", getRandomElement(["DSLR", "Mirrorless", "Point & Shoot"]))
        .replace("{megapixels}", getRandomElement(["20", "24", "32", "45"]))
        .replace("{platform}", getRandomElement(["PlayStation 5", "Xbox Series X", "Nintendo Switch"]))
        .replace("{game}", faker.commerce.productName())
        .replace("{year}", String(getRandomInt(2015, 2024)))
        .replace("{mileage}", String(getRandomInt(10000, 150000)))
        .replace("{fuel}", getRandomElement(["Petrol", "Diesel", "Hybrid"]))
        .replace("{transmission}", getRandomElement(["Manual", "Automatic"]))
        .replace("{cc}", getRandomElement(["125", "150", "160", "200", "250"]))
        .replace("{compatible}", getRandomElement(["Toyota", "Honda", "Nissan"]))
        .replace("{bedrooms}", getRandomElement(["1", "2", "3", "4"]))
        .replace("{bathrooms}", getRandomElement(["1", "2", "3"]))
        .replace("{for}", getRandomElement(["Sale", "Rent"]))
        .replace("{furnished}", getRandomElement(["Furnished", "Semi-Furnished", "Unfurnished"]))
        .replace("{floors}", getRandomElement(["2", "3", "4"]))
        .replace("{size}", String(getRandomInt(800, 3000)));

      const price = getRandomInt(template.priceRange[0], template.priceRange[1]);
      const createdAt = faker.date.past({ years: 1 });

      const listing = await prisma.listing.create({
        data: {
          title,
          slug: `${faker.helpers.slugify(title).toLowerCase()}-${faker.string.alphanumeric(6)}`,
          description: faker.lorem.paragraphs({ min: 2, max: 5 }),
          price,
          negotiable: Math.random() > 0.3,
          status: Math.random() > 0.1 ? "ACTIVE" : getRandomElement(["SOLD", "EXPIRED"]),
          views: getRandomInt(0, 500),
          featured: Math.random() > 0.95,
          userId: user.id,
          categoryId: category.id,
          locationId: location.id,
          createdAt,
          updatedAt: createdAt,
          expiresAt: new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      listings.push({ id: listing.id, userId: user.id, categoryId: category.id });

      // Add images
      const imageCount = getRandomInt(CONFIG.imagesPerListing.min, CONFIG.imagesPerListing.max);
      for (let j = 0; j < imageCount; j++) {
        const seed = `${listing.id}-${j}`;
        await prisma.listingImage.create({
          data: {
            url: getRandomImage(seed),
            publicId: `mock/${seed}`,
            order: j,
            listingId: listing.id,
          },
        });
      }

      // Add attribute values
      if (category.attributes.length > 0) {
        for (const attr of category.attributes) {
          let value: string | null = null;

          if (attr.type === "SELECT" && attr.options.length > 0) {
            value = getRandomElement(attr.options);
          } else if (attr.type === "NUMBER") {
            if (attr.slug === "year") {
              value = String(getRandomInt(2010, 2024));
            } else if (attr.slug === "mileage") {
              value = String(getRandomInt(1000, 200000));
            } else if (attr.slug === "cc") {
              value = String(getRandomInt(100, 1000));
            } else if (attr.slug === "size") {
              value = String(getRandomInt(500, 5000));
            } else {
              value = String(getRandomInt(1, 100));
            }
          } else if (attr.type === "BOOLEAN") {
            value = Math.random() > 0.5 ? "true" : "false";
          } else if (attr.type === "TEXT") {
            value = faker.lorem.words(3);
          }

          if (value && (attr.required || Math.random() > 0.3)) {
            await prisma.listingAttributeValue.create({
              data: {
                listingId: listing.id,
                attributeId: attr.id,
                value,
              },
            });
          }
        }
      }
    }

    if ((users.indexOf(user) + 1) % 20 === 0) {
      console.log(`  Processed ${users.indexOf(user) + 1}/${users.length} users`);
    }
  }
  console.log(`✅ Created ${listings.length} listings with images and attributes\n`);

  // Create conversations and messages
  console.log("Creating conversations and messages...");
  let conversationCount = 0;
  let messageCount = 0;

  for (const listing of listings.slice(0, Math.floor(listings.length * 0.3))) {
    const convCount = getRandomInt(CONFIG.conversationsPerListing.min, CONFIG.conversationsPerListing.max);
    const potentialBuyers = users.filter((u) => u.id !== listing.userId);
    const shuffledBuyers = potentialBuyers.sort(() => 0.5 - Math.random());
    const buyers = shuffledBuyers.slice(0, Math.min(convCount, shuffledBuyers.length));

    for (const buyer of buyers) {
      const conversation = await prisma.conversation.create({
        data: {
          listingId: listing.id,
          participants: {
            create: [
              { userId: listing.userId },
              { userId: buyer.id },
            ],
          },
        },
      });
      conversationCount++;

      // Create messages
      const msgCount = getRandomInt(CONFIG.messagesPerConversation.min, CONFIG.messagesPerConversation.max);
      const participants = [listing.userId, buyer.id];

      for (let i = 0; i < msgCount; i++) {
        const senderId = participants[i % 2];
        await prisma.message.create({
          data: {
            content: faker.lorem.sentence({ min: 3, max: 15 }),
            conversationId: conversation.id,
            senderId,
            read: i < msgCount - 2,
            createdAt: faker.date.recent({ days: 7 }),
          },
        });
        messageCount++;
      }
    }
  }
  console.log(`✅ Created ${conversationCount} conversations with ${messageCount} messages\n`);

  // Summary
  const totalListings = await prisma.listing.count();
  const totalUsers = await prisma.user.count();
  const totalImages = await prisma.listingImage.count();
  const totalAttributes = await prisma.listingAttributeValue.count();
  const totalConversations = await prisma.conversation.count();
  const totalMessages = await prisma.message.count();

  console.log("📊 Database Summary:");
  console.log(`   Users: ${totalUsers}`);
  console.log(`   Listings: ${totalListings}`);
  console.log(`   Images: ${totalImages}`);
  console.log(`   Attribute Values: ${totalAttributes}`);
  console.log(`   Conversations: ${totalConversations}`);
  console.log(`   Messages: ${totalMessages}`);
  console.log("\n🎉 Mock data generation complete!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
