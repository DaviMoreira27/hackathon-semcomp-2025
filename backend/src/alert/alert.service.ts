import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AlertService {
  constructor(private readonly prisma: PrismaService) {}

  enqueue(userId: string, type: Prisma.$Enums.AlertType, payload: any, scheduledAt?: Date | null) { // << aqui
    return this.prisma.alert.create({
      data: {
        userId,
        type,
        payload,
        scheduledAt: scheduledAt ?? null,
        isActive: true,
      },
    });
  }

  markSent(id: string) {
    return this.prisma.alert.update({
      where: { id },
      data: { sentAt: new Date(), isActive: false },
    });
  }

  dueReminders(now = new Date()) {
    return this.prisma.alert.findMany({
      where: { isActive: true, scheduledAt: { lte: now } },
      orderBy: [{ scheduledAt: 'asc' }],
    });
  }

  list(userId: string) {
    return this.prisma.alert.findMany({
      where: { userId, isActive: true },
      orderBy: [{ createdAt: 'desc' }],
    });
  }
}
