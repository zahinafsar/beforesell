import { PrismaClient, AttributeType } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Electronics", slug: "electronics", icon: "Laptop" },
  { name: "Vehicles", slug: "vehicles", icon: "Car" },
  { name: "Property", slug: "property", icon: "Home" },
  { name: "Fashion", slug: "fashion", icon: "Shirt" },
  { name: "Pets", slug: "pets", icon: "PawPrint" },
  { name: "Home & Living", slug: "home-living", icon: "Sofa" },
  { name: "Hobbies & Sports", slug: "hobbies-sports", icon: "Dumbbell" },
  { name: "Business", slug: "business", icon: "Building" },
  { name: "Education", slug: "education", icon: "GraduationCap" },
  { name: "Services", slug: "services", icon: "Wrench" },
  { name: "Agriculture", slug: "agriculture", icon: "Leaf" },
  { name: "Essentials", slug: "essentials", icon: "ShoppingBag" },
];

const subcategories: Record<string, { name: string; slug: string }[]> = {
  electronics: [
    { name: "Mobile Phones", slug: "mobile-phones" },
    { name: "Laptops", slug: "laptops" },
    { name: "Computers", slug: "computers" },
    { name: "TVs", slug: "tvs" },
    { name: "Cameras", slug: "cameras" },
    { name: "Gaming", slug: "gaming" },
  ],
  vehicles: [
    { name: "Cars", slug: "cars" },
    { name: "Motorcycles", slug: "motorcycles" },
    { name: "Bicycles", slug: "bicycles" },
    { name: "Auto Parts", slug: "auto-parts" },
  ],
  property: [
    { name: "Apartments", slug: "apartments" },
    { name: "Houses", slug: "houses" },
    { name: "Land", slug: "land" },
    { name: "Commercial", slug: "commercial" },
  ],
};

type AttributeDef = {
  name: string;
  slug: string;
  type: AttributeType;
  options?: string[];
  unit?: string;
  required?: boolean;
  filterable?: boolean;
  order: number;
};

const categoryAttributes: Record<string, AttributeDef[]> = {
  "mobile-phones": [
    { name: "Brand", slug: "brand", type: "SELECT", options: ["Apple", "Samsung", "Xiaomi", "Oppo", "Vivo", "Realme", "OnePlus", "Google", "Huawei", "Other"], required: true, order: 1 },
    { name: "RAM", slug: "ram", type: "SELECT", options: ["2GB", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB"], order: 2 },
    { name: "Storage", slug: "storage", type: "SELECT", options: ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"], order: 3 },
    { name: "Condition", slug: "condition", type: "SELECT", options: ["New", "Like New", "Good", "Fair"], required: true, order: 4 },
  ],
  laptops: [
    { name: "Brand", slug: "brand", type: "SELECT", options: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "MSI", "Microsoft", "Other"], required: true, order: 1 },
    { name: "Processor", slug: "processor", type: "SELECT", options: ["Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 3", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9", "Apple M1", "Apple M2", "Apple M3", "Other"], order: 2 },
    { name: "RAM", slug: "ram", type: "SELECT", options: ["4GB", "8GB", "16GB", "32GB", "64GB"], order: 3 },
    { name: "Storage", slug: "storage", type: "SELECT", options: ["128GB SSD", "256GB SSD", "512GB SSD", "1TB SSD", "1TB HDD", "2TB HDD"], order: 4 },
    { name: "Screen Size", slug: "screen-size", type: "SELECT", options: ["11\"", "13\"", "14\"", "15\"", "16\"", "17\""], order: 5 },
    { name: "Condition", slug: "condition", type: "SELECT", options: ["New", "Like New", "Good", "Fair"], required: true, order: 6 },
  ],
  computers: [
    { name: "Brand", slug: "brand", type: "SELECT", options: ["Custom Build", "Dell", "HP", "Lenovo", "Asus", "Acer", "Apple", "Other"], required: true, order: 1 },
    { name: "Processor", slug: "processor", type: "SELECT", options: ["Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 3", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9", "Other"], order: 2 },
    { name: "RAM", slug: "ram", type: "SELECT", options: ["4GB", "8GB", "16GB", "32GB", "64GB", "128GB"], order: 3 },
    { name: "Storage", slug: "storage", type: "SELECT", options: ["256GB SSD", "512GB SSD", "1TB SSD", "1TB HDD", "2TB HDD", "4TB HDD"], order: 4 },
    { name: "GPU", slug: "gpu", type: "SELECT", options: ["Integrated", "NVIDIA GTX Series", "NVIDIA RTX Series", "AMD Radeon", "Other"], order: 5 },
    { name: "Condition", slug: "condition", type: "SELECT", options: ["New", "Like New", "Good", "Fair"], required: true, order: 6 },
  ],
  tvs: [
    { name: "Brand", slug: "brand", type: "SELECT", options: ["Samsung", "LG", "Sony", "TCL", "Hisense", "Xiaomi", "Walton", "Other"], required: true, order: 1 },
    { name: "Screen Size", slug: "screen-size", type: "SELECT", options: ["32\"", "40\"", "43\"", "50\"", "55\"", "65\"", "75\"", "85\""], order: 2 },
    { name: "Resolution", slug: "resolution", type: "SELECT", options: ["HD", "Full HD", "4K UHD", "8K UHD"], order: 3 },
    { name: "Smart TV", slug: "smart-tv", type: "BOOLEAN", order: 4 },
    { name: "Condition", slug: "condition", type: "SELECT", options: ["New", "Like New", "Good", "Fair"], required: true, order: 5 },
  ],
  cameras: [
    { name: "Brand", slug: "brand", type: "SELECT", options: ["Canon", "Nikon", "Sony", "Fujifilm", "Panasonic", "GoPro", "DJI", "Other"], required: true, order: 1 },
    { name: "Type", slug: "type", type: "SELECT", options: ["DSLR", "Mirrorless", "Point & Shoot", "Action Camera", "Drone"], order: 2 },
    { name: "Megapixels", slug: "megapixels", type: "SELECT", options: ["12MP", "16MP", "20MP", "24MP", "32MP", "45MP", "50MP+"], order: 3 },
    { name: "Condition", slug: "condition", type: "SELECT", options: ["New", "Like New", "Good", "Fair"], required: true, order: 4 },
  ],
  gaming: [
    { name: "Platform", slug: "platform", type: "SELECT", options: ["PlayStation", "Xbox", "Nintendo", "PC", "Other"], required: true, order: 1 },
    { name: "Type", slug: "type", type: "SELECT", options: ["Console", "Game", "Controller", "Accessory"], required: true, order: 2 },
    { name: "Condition", slug: "condition", type: "SELECT", options: ["New", "Like New", "Good", "Fair"], required: true, order: 3 },
  ],
  cars: [
    { name: "Brand", slug: "brand", type: "SELECT", options: ["Toyota", "Honda", "Nissan", "Mitsubishi", "Suzuki", "Hyundai", "Kia", "BMW", "Mercedes-Benz", "Audi", "Other"], required: true, order: 1 },
    { name: "Year", slug: "year", type: "NUMBER", unit: "", required: true, order: 2 },
    { name: "Mileage", slug: "mileage", type: "NUMBER", unit: "km", order: 3 },
    { name: "Fuel Type", slug: "fuel-type", type: "SELECT", options: ["Petrol", "Diesel", "Hybrid", "Electric", "CNG", "LPG"], required: true, order: 4 },
    { name: "Transmission", slug: "transmission", type: "SELECT", options: ["Manual", "Automatic", "CVT", "Semi-Automatic"], required: true, order: 5 },
    { name: "Body Type", slug: "body-type", type: "SELECT", options: ["Sedan", "SUV", "Hatchback", "Pickup", "Van", "Coupe", "Convertible", "Wagon"], order: 6 },
    { name: "Condition", slug: "condition", type: "SELECT", options: ["New", "Used"], required: true, order: 7 },
  ],
  motorcycles: [
    { name: "Brand", slug: "brand", type: "SELECT", options: ["Honda", "Yamaha", "Suzuki", "Bajaj", "TVS", "Hero", "KTM", "Royal Enfield", "Kawasaki", "Other"], required: true, order: 1 },
    { name: "Engine CC", slug: "cc", type: "NUMBER", unit: "cc", order: 2 },
    { name: "Year", slug: "year", type: "NUMBER", unit: "", required: true, order: 3 },
    { name: "Mileage", slug: "mileage", type: "NUMBER", unit: "km", order: 4 },
    { name: "Condition", slug: "condition", type: "SELECT", options: ["New", "Used"], required: true, order: 5 },
  ],
  bicycles: [
    { name: "Type", slug: "type", type: "SELECT", options: ["Mountain", "Road", "Hybrid", "BMX", "Folding", "Electric", "Kids"], required: true, order: 1 },
    { name: "Brand", slug: "brand", type: "SELECT", options: ["Giant", "Trek", "Specialized", "Phoenix", "Hero", "Duranta", "Other"], order: 2 },
    { name: "Condition", slug: "condition", type: "SELECT", options: ["New", "Like New", "Good", "Fair"], required: true, order: 3 },
  ],
  "auto-parts": [
    { name: "Part Type", slug: "type", type: "SELECT", options: ["Engine Parts", "Body Parts", "Electrical", "Tires & Wheels", "Interior", "Exterior", "Accessories", "Other"], required: true, order: 1 },
    { name: "Compatible Brand", slug: "compatible-brand", type: "SELECT", options: ["Toyota", "Honda", "Nissan", "Mitsubishi", "Suzuki", "Universal", "Other"], order: 2 },
    { name: "Condition", slug: "condition", type: "SELECT", options: ["New", "Used"], required: true, order: 3 },
  ],
  apartments: [
    { name: "Bedrooms", slug: "bedrooms", type: "SELECT", options: ["Studio", "1", "2", "3", "4", "5+"], required: true, order: 1 },
    { name: "Bathrooms", slug: "bathrooms", type: "SELECT", options: ["1", "2", "3", "4+"], required: true, order: 2 },
    { name: "Size", slug: "size", type: "NUMBER", unit: "sqft", order: 3 },
    { name: "Furnished", slug: "furnished", type: "SELECT", options: ["Unfurnished", "Semi-Furnished", "Fully Furnished"], order: 4 },
    { name: "For", slug: "for", type: "SELECT", options: ["Sale", "Rent"], required: true, order: 5 },
  ],
  houses: [
    { name: "Bedrooms", slug: "bedrooms", type: "SELECT", options: ["1", "2", "3", "4", "5", "6+"], required: true, order: 1 },
    { name: "Bathrooms", slug: "bathrooms", type: "SELECT", options: ["1", "2", "3", "4", "5+"], required: true, order: 2 },
    { name: "Size", slug: "size", type: "NUMBER", unit: "sqft", order: 3 },
    { name: "Floors", slug: "floors", type: "SELECT", options: ["1", "2", "3", "4+"], order: 4 },
    { name: "For", slug: "for", type: "SELECT", options: ["Sale", "Rent"], required: true, order: 5 },
  ],
  land: [
    { name: "Size", slug: "size", type: "NUMBER", unit: "katha", required: true, order: 1 },
    { name: "Type", slug: "type", type: "SELECT", options: ["Residential", "Commercial", "Agricultural", "Industrial"], required: true, order: 2 },
  ],
  commercial: [
    { name: "Type", slug: "type", type: "SELECT", options: ["Office Space", "Shop", "Warehouse", "Factory", "Showroom", "Restaurant Space"], required: true, order: 1 },
    { name: "Size", slug: "size", type: "NUMBER", unit: "sqft", order: 2 },
    { name: "For", slug: "for", type: "SELECT", options: ["Sale", "Rent"], required: true, order: 3 },
  ],
};

const locations = [
  "Dhaka",
  "Faridpur",
  "Gazipur",
  "Gopalganj",
  "Kishoreganj",
  "Madaripur",
  "Manikganj",
  "Munshiganj",
  "Narayanganj",
  "Narsingdi",
  "Rajbari",
  "Shariatpur",
  "Tangail",
  "Chattogram",
  "Bandarban",
  "Brahmanbaria",
  "Chandpur",
  "Comilla",
  "Cox's Bazar",
  "Feni",
  "Khagrachhari",
  "Lakshmipur",
  "Noakhali",
  "Rangamati",
  "Rajshahi",
  "Bogra",
  "Chapainawabganj",
  "Joypurhat",
  "Naogaon",
  "Natore",
  "Nawabganj",
  "Pabna",
  "Sirajganj",
  "Khulna",
  "Bagerhat",
  "Chuadanga",
  "Jessore",
  "Jhenaidah",
  "Kushtia",
  "Magura",
  "Meherpur",
  "Narail",
  "Satkhira",
  "Barishal",
  "Barguna",
  "Bhola",
  "Jhalokathi",
  "Patuakhali",
  "Pirojpur",
  "Sylhet",
  "Habiganj",
  "Moulvibazar",
  "Sunamganj",
  "Rangpur",
  "Dinajpur",
  "Gaibandha",
  "Kurigram",
  "Lalmonirhat",
  "Nilphamari",
  "Panchagarh",
  "Thakurgaon",
  "Mymensingh",
  "Jamalpur",
  "Netrokona",
  "Sherpur",
];

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.listingAttributeValue.deleteMany();
  await prisma.categoryAttribute.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();

  // Store category IDs for attribute seeding
  const categoryIdMap: Record<string, string> = {};

  // Seed categories
  for (const cat of categories) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });

    const subs = subcategories[cat.slug];
    if (subs) {
      for (const sub of subs) {
        const subCategory = await prisma.category.upsert({
          where: { slug: sub.slug },
          update: {},
          create: {
            ...sub,
            parentId: parent.id,
          },
        });
        categoryIdMap[sub.slug] = subCategory.id;
      }
    }
  }
  console.log("Categories seeded");

  // Seed category attributes
  for (const [categorySlug, attributes] of Object.entries(categoryAttributes)) {
    const categoryId = categoryIdMap[categorySlug];
    if (!categoryId) {
      console.warn(`Category ${categorySlug} not found, skipping attributes`);
      continue;
    }

    for (const attr of attributes) {
      await prisma.categoryAttribute.upsert({
        where: {
          categoryId_slug: {
            categoryId,
            slug: attr.slug,
          },
        },
        update: {
          name: attr.name,
          type: attr.type,
          options: attr.options || [],
          unit: attr.unit,
          required: attr.required ?? false,
          filterable: attr.filterable ?? true,
          order: attr.order,
        },
        create: {
          name: attr.name,
          slug: attr.slug,
          type: attr.type,
          options: attr.options || [],
          unit: attr.unit,
          required: attr.required ?? false,
          filterable: attr.filterable ?? true,
          order: attr.order,
          categoryId,
        },
      });
    }
    console.log(`Attributes seeded for ${categorySlug}`);
  }
  console.log("Category attributes seeded");

  // Seed locations
  for (const address of locations) {
    await prisma.location.upsert({
      where: { address },
      update: {},
      create: { address },
    });
  }
  console.log("Locations seeded");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
