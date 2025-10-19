import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { addDays, addMonths } from 'date-fns';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  upsert(userId: string, merchant: string, lastChargeDate: Date, periodicityDays?: number) {
    return this.prisma.subscription.upsert({
      where: { userId_merchant: { userId, merchant } },
      update: {
        lastChargeDate,
        periodicityDays,
        periodicity: Prisma.$Enums.Periodicity.MONTHLY, // << aqui
        isActive: true,
      },
      create: {
        userId,
        merchant,
        lastChargeDate,
        periodicityDays,
        periodicity: Prisma.$Enums.Periodicity.MONTHLY, // << aqui
        isActive: true,
      },
    });
  }

  nextDueDate(sub: { lastChargeDate: Date; periodicityDays?: number | null }) {
    if (sub.periodicityDays && sub.periodicityDays > 0) {
      return addDays(sub.lastChargeDate, sub.periodicityDays);
    }
    return addMonths(sub.lastChargeDate, 1);
  }

  list(userId: string) {
    return this.prisma.subscription.findMany({ where: { userId, isActive: true } });
  }
}
