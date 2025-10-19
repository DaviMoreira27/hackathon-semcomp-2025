import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PiggyService {
  constructor(private readonly prisma: PrismaService) {}

  async deposit(userId: string, amount: number) {
    await this.prisma.piggyLedger.create({ data: { userId, amount } });
    return this.balance(userId);
  }

  async balance(userId: string) {
    const { _sum } = await this.prisma.piggyLedger.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    return _sum.amount ?? 0;
  }
}
