// src/statement/statement.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { OpenaiService } from '../openai/openai.service';
import * as fs from 'fs';
import * as path from 'path';
import { BankStatement } from './statement.types';

@Injectable()
export class StatementService {
  private readonly logger = new Logger(StatementService.name);

  constructor(private readonly openaiService: OpenaiService) {}

  public async getStatementAnalysis(userId: string): Promise<string> {
    this.logger.log(`Iniciando análise de extrato para o usuário ${userId}`);

    // 1. Lê o arquivo JSON do seu projeto
    // (Para um sistema real, você faria o upload do arquivo)
    const filePath = path.join(__dirname, '..', '..', 'extrato.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const statementData = JSON.parse(fileContent);
    const transactions = statementData.bankStatement.transactions;

    if (!transactions || transactions.length === 0) {
      return 'Não encontrei transações no seu extrato.';
    }

    // 2. Formata as transações como um texto simples para a IA entender
    const transactionsText = transactions
      .filter((t: any) => t.category.toLowerCase().includes('enviada') === false && t.category.toLowerCase().includes('recebida') === false && t.category.toLowerCase().includes('rendimento') === false) // Filtra apenas despesas
      .map((t: any) => `- ${t.date}: ${t.merchant || t.category} - R$ ${t.amount.toFixed(2)}`)
      .join('\n');

    // 3. Chama o novo método de análise no OpenaiService
    const analysis = await this.openaiService.getStatementAnalysis(transactionsText);

    return analysis;
  }
}