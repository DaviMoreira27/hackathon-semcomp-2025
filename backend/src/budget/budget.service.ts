import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class BudgetService {
  constructor(private readonly prisma: PrismaService) {}

  setLimit(
    userId: string,
    scopeType: 'CATEGORY' | 'MERCHANT',
    scopeKey: string,
    limitAmount: number,
    monthRef?: string | null,
  ) {
    return this.prisma.budget.upsert({
      where: {
        userId_scopeType_scopeKey_monthRef: {
          userId,
          scopeType: scopeType as Prisma.$Enums.ScopeType, // << aqui
          scopeKey,
          monthRef: monthRef ?? null,
        },
      },
      update: { limitAmount, isActive: true },
      create: {
        userId,
        scopeType: scopeType as Prisma.$Enums.ScopeType, // << aqui
        scopeKey,
        limitAmount,
        monthRef: monthRef ?? null,
      },
    });
  }

  listLimits(userId: string) {
    return this.prisma.budget.findMany({
      where: { userId, isActive: true },
      orderBy: [{ createdAt: 'desc' }],
    });
  }
}
