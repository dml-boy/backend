import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();
const defaultPoints = 100_000_000_000;

async function seedAdminPoints() {
  try {
    const result = await prisma.user.updateMany({
      where: {
        role: Role.ADMIN,
        OR: [
          { staffPoints: 0 },
          { staffPoints: 100000000000 },
        ],
      },
      data: {
        staffPoints: { set: defaultPoints },
      },
    });

    console.log(`✅ Seeded ${result.count} admin(s) with default points.`);
  } catch (error) {
    console.error('❌ Failed to seed admin points:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdminPoints();
