import { PrismaClient } from '@prisma/client';
import sampleData from './sample-data';
import { hash } from '@/lib/encrypt';

async function main() {
  const prisma = new PrismaClient();
  await prisma.product.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // Create sample products
  await prisma.product.createMany({ data: sampleData.products });

  // Create sample users and hash their passwords
  const users = await Promise.all(
    sampleData.users.map(async (user) => ({
      ...user,
      password: await hash(user.password),
    })),
  );

  await prisma.user.createMany({ data: users });

  console.log('Database seeded successfully!');
}

main();

// Running by terminal command npx tsx ./db/seed
