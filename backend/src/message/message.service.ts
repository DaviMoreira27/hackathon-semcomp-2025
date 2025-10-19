// src/message/message.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { BudgetService } from '../budget/budget.service';
import { PiggyService } from '../piggy/piggy.service';
import { OpenaiService } from '../openai/openai.service';
import { StatementService } from '../statement/statement.service';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly budgetService: BudgetService,
    private readonly piggyService: PiggyService,
    private readonly openaiService: OpenaiService,
    private readonly statementService: StatementService,
  ) {}

  /**
   * Relatório mensal personalizado
   */
  async monthlyReport(userId: string) {
    try {
      // Busca resumo de transações do usuário
      const analysis = await this.statementService.getStatementAnalysis(userId);

      // Prompt para IA gerar recomendações de economia e investimento
      const prompt = `
Você é um consultor financeiro. Analise este resumo de transações do usuário:
${analysis}

Sugira de forma amigável:
- Onde ele pode reduzir gastos
- Dicas de investimento (como CDI, Tesouro Selic)
- Conselhos práticos e claros
Responda em português.
      `;

      const aiResponse = await this.openaiService.getChatResponse(prompt, userId);
      return { text: aiResponse };
    } catch (error) {
      this.logger.error('Erro ao gerar relatório mensal', error);
      return { text: 'Desculpe, não consegui gerar seu relatório mensal no momento.' };
    }
  }

  /**
   * Pergunta sobre categorias que o usuário quer reduzir
   */
  async askCategories(userId: string) {
    const prompt = `
Você é um consultor financeiro. Pergunte ao usuário quais categorias ele quer reduzir.
Liste exemplos como: Mercado, Restaurantes, Transporte, Streaming, Saúde, Lazer.
Responda de forma amigável.
    `;

    try {
      const aiResponse = await this.openaiService.getChatResponse(prompt, userId);
      return { text: aiResponse };
    } catch (error) {
      this.logger.error('Erro ao perguntar sobre categorias', error);
      return { text: 'Não consegui perguntar sobre categorias no momento.' };
    }
  }

  /**
   * Sugestões para categorias específicas
   */
  async suggestionsForCategories(userId: string, cats: string[]) {
    const prompt = `
Você é um consultor financeiro. O usuário quer economizar nas seguintes categorias: ${cats.join(
      ', ',
    )}.
Sugira ações concretas, dicas de redução de gastos e investimentos possíveis, como colocar no CDI ou Tesouro Selic.
Responda de forma amigável e concisa.
    `;

    try {
      const aiResponse = await this.openaiService.getChatResponse(prompt, userId);
      return { text: aiResponse };
    } catch (error) {
      this.logger.error('Erro ao gerar sugestões para categorias', error);
      return { text: 'Não consegui gerar sugestões para essas categorias no momento.' };
    }
  }

  /**
   * Criar alertas de cancelamento
   */
  async createCancelAlert(userId: string, service: string) {
    return { text: `🔔 Aviso de cancelamento criado para ${service}.` };
  }

  /**
   * Criar limite de gasto para categoria ou serviço
   */
  async createLimit(userId: string, target: string, value: number) {
    return { text: `✅ Limite criado: ${target} = R$ ${value} (alerta 80%/100%).` };
  }

  /**
   * Adicionar valor à "caixinha"
   */
  async addToPiggy(userId: string, amount: number) {
    // mock saldo — você pode integrar com PiggyService real depois
    const total = 760 + amount;
    return { text: `💰 Adicionados R$ ${amount} à caixinha. Total: R$ ${total}.` };
  }
}
