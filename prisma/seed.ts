import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Electronics", slug: "electronics", icon: "Laptop" },
  { name: "Vehicles", slug: "vehicles", icon: "Car" },
  { name: "Property", slug: "property", icon: "Home" },
  { name: "Jobs", slug: "jobs", icon: "Briefcase" },
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

const divisions = [
  {
    name: "Dhaka",
    slug: "dhaka",
    districts: [
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
    ],
  },
  {
    name: "Chattogram",
    slug: "chattogram",
    districts: [
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
    ],
  },
  {
    name: "Rajshahi",
    slug: "rajshahi",
    districts: [
      "Rajshahi",
      "Bogra",
      "Chapainawabganj",
      "Joypurhat",
      "Naogaon",
      "Natore",
      "Nawabganj",
      "Pabna",
      "Sirajganj",
    ],
  },
  {
    name: "Khulna",
    slug: "khulna",
    districts: [
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
    ],
  },
  {
    name: "Barishal",
    slug: "barishal",
    districts: [
      "Barishal",
      "Barguna",
      "Bhola",
      "Jhalokathi",
      "Patuakhali",
      "Pirojpur",
    ],
  },
  {
    name: "Sylhet",
    slug: "sylhet",
    districts: ["Sylhet", "Habiganj", "Moulvibazar", "Sunamganj"],
  },
  {
    name: "Rangpur",
    slug: "rangpur",
    districts: [
      "Rangpur",
      "Dinajpur",
      "Gaibandha",
      "Kurigram",
      "Lalmonirhat",
      "Nilphamari",
      "Panchagarh",
      "Thakurgaon",
    ],
  },
  {
    name: "Mymensingh",
    slug: "mymensingh",
    districts: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"],
  },
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[']/g, "")
    .replace(/\s+/g, "-");
}

async function main() {
  console.log("Seeding database...");

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
        await prisma.category.upsert({
          where: { slug: sub.slug },
          update: {},
          create: {
            ...sub,
            parentId: parent.id,
          },
        });
      }
    }
  }
  console.log("Categories seeded");

  // Seed divisions and districts
  for (const div of divisions) {
    const division = await prisma.division.upsert({
      where: { slug: div.slug },
      update: {},
      create: { name: div.name, slug: div.slug },
    });

    for (const distName of div.districts) {
      const distSlug = slugify(distName);
      await prisma.district.upsert({
        where: { slug: distSlug },
        update: {},
        create: {
          name: distName,
          slug: distSlug,
          divisionId: division.id,
        },
      });
    }
  }
  console.log("Divisions and districts seeded");

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
