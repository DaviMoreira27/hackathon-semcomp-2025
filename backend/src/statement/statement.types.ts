// src/statement/statement.types.ts

// A palavra "export" já estava aqui, o que é ótimo.
export interface Transaction {
  date: string;
  category: string;
  amount: number;
  balanceAfter: number;
  merchant?: string;
  counterparty?: string;
  source?: string;
}

// ADICIONE O "EXPORT" AQUI
export interface BankStatement {
  account: object;
  period: object;
  balance: object;
  transactions: Transaction[];
}