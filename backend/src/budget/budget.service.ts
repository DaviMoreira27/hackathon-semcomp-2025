// src/budget/budget.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ScopeType } from '@prisma/client';

@Injectable()
export class BudgetService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria um novo orçamento para um usuário.
   * O campo monthRef é opcional e só será incluído na query se for fornecido.
   */
  async createBudget(
    userId: string,
    scopeType: string,
    scopeKey: string,
    limitAmount: number,
    monthRef?: string | null, // A assinatura do método aceita string, null ou undefined
  ) {
    return this.prisma.budget.create({
      data: {
        userId,
        scopeType: scopeType as ScopeType, // Faz o cast do tipo para o enum do Prisma
        scopeKey,
        limitAmount,
        // ESTA É A CORREÇÃO:
        // A propriedade 'monthRef' só é adicionada ao objeto 'data'
        // se a variável 'monthRef' não for nula nem undefined.
        ...(monthRef && { monthRef }),
      },
    });
  }

  /**
   * Encontra todos os orçamentos ativos de um determinado usuário.
   */
  async findActiveBudgetsByUser(userId: string) {
    return this.prisma.budget.findMany({
      where: {
        userId,
        isActive: true,
      },
    });
  }

  /**
   * Desativa um orçamento existente.
   */
  async deactivateBudget(budgetId: string) {
    return this.prisma.budget.update({
      where: {
        id: budgetId,
      },
      data: {
        isActive: false,
      },
    });
  }
}