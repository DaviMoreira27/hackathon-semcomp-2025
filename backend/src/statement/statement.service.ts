import { Injectable } from '@nestjs/common';
import { Statement } from './statement.types';

@Injectable()
export class StatementService {
  parseMonthRef(statement: Statement) {
    const start = statement.bankStatement.period.startDate; // ex "2025-10-01"
    return start.slice(0, 7); // "2025-10"
  }

  sumByCategory(statement: Statement) {
    const tx = statement.bankStatement.transactions;
    const totalSpent = tx.filter(t => this.isExpense(t.category)).reduce((a, t) => a + t.amount, 0);
    const byCat = new Map<string, number>();
    for (const t of tx) {
      if (!this.isExpense(t.category)) continue;
      byCat.set(t.category, (byCat.get(t.category) ?? 0) + t.amount);
    }
    const byCategory = [...byCat.entries()].map(([name, amount]) => ({
      name,
      amount,
      pct: totalSpent ? Math.round((amount / totalSpent) * 100) : 0,
    }));
    return { totalSpent, byCategory };
  }

  private isExpense(cat: string) {
    // trate aqui categorias de renda/recebimentos para não contar como gasto
    const income = new Set(['Transferência Recebida', 'Rendimento']);
    return !income.has(cat);
  }
}
