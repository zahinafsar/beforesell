import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const USER_COUNT = 543;

async function main() {
  console.log(`Creating ${USER_COUNT} dummy users...\n`);

  const hashedPassword = await bcrypt.hash("password123", 10);
  let created = 0;

  for (let i = 0; i < USER_COUNT; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    try {
      await prisma.user.create({
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
      created++;

      if ((i + 1) % 50 === 0) {
        console.log(`  Created ${i + 1}/${USER_COUNT} users`);
      }
    } catch (e) {
      // Email collision, retry with different email
      i--;
    }
  }

  console.log(`\n✅ Created ${created} users`);
  console.log(`Total users in DB: ${await prisma.user.count()}`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
