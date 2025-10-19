import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { chatId: 'demo-user-1' },
    update: {},
    create: { chatId: 'demo-user-1' },
  });

  await prisma.budget.upsert({
    where: { userId_scopeType_scopeKey_monthRef: { userId: user.id, scopeType: 'CATEGORY', scopeKey: 'Lazer', monthRef: null } as any },
    update: { limitAmount: 250 },
    create: { userId: user.id, scopeType: 'CATEGORY', scopeKey: 'Lazer', limitAmount: 250 },
  });

  await prisma.piggyLedger.create({ data: { userId: user.id, amount: 500 } });

  await prisma.subscription.upsert({
    where: { userId_merchant: { userId: user.id, merchant: 'Netflix' } },
    update: { lastChargeDate: new Date('2025-10-07'), periodicityDays: 30 },
    create: { userId: user.id, merchant: 'Netflix', lastChargeDate: new Date('2025-10-07'), periodicityDays: 30 },
  });
}

main().finally(() => prisma.$disconnect());
