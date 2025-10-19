// src/telegram/telegram.update.ts
import { Ctx, Hears, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { MessageService } from '../message/message.service';
import { OpenaiService } from '../openai/openai.service';
import { StatementService } from '../statement/statement.service';
import { Logger } from '@nestjs/common';

@Update()
export class TelegramUpdate {
  private readonly logger = new Logger(TelegramUpdate.name);

  constructor(
    private readonly messages: MessageService,
    private readonly openaiService: OpenaiService,
    private readonly statementService: StatementService,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.reply(
      'Olá! Sou seu assistente financeiro 💬\n\n' +
      'Você pode me pedir para:\n' +
      '• "Analise meu extrato"\n' +
      '• "Feche meu mês"\n' +
      '• "Analisar onde economizar"\n' +
      '• "Guardar dinheiro no CDI"\n' +
      '• "Limite meus gastos"\n\n' +
      'Ou apenas converse comigo!'
    );
  }

  // Comandos baseados em regras
  @Hears(['feche meu mês', 'feche meu mes', 'relatório', 'relatorio'])
  async monthly(@Ctx() ctx: Context) {
    // CORRIGIDO AQUI
    this.logger.log(`Comando 'monthly' acionado por ${ctx.from?.id ?? 'ID_Desconhecido'}`);
    const r = await this.messages.monthlyReport(String(ctx.from?.id ?? 'anon'));
    await ctx.reply(r.text);
  }

  @Hears(['analisar onde economizar', 'economizar'])
  async plan(@Ctx() ctx: Context) {
    // CORRIGIDO AQUI
    this.logger.log(`Comando 'plan' acionado por ${ctx.from?.id ?? 'ID_Desconhecido'}`);
    const r = await this.messages.askCategories(String(ctx.from?.id ?? 'anon'));
    await ctx.reply(r.text);
  }

  @Hears(/(adicionar|guardar)\s*(\d+[\.,]?\d*)\s*(na\s+caixinha|caixinha)/i)
  async piggy(@Ctx() ctx: Context) {
    const text = (ctx.message as any).text as string;
    // CORRIGIDO AQUI
    this.logger.log(`Comando 'piggy' acionado por ${ctx.from?.id ?? 'ID_Desconhecido'} com texto: "${text}"`);
    const m = text.match(/(\d+[\.,]?\d*)/);
    const amount = m ? Number(m[1].replace(',', '.')) : 0;
    if (!amount) return ctx.reply('Qual valor? Ex.: "adicionar 100 na caixinha"');
    const r = await this.messages.addToPiggy(String(ctx.from?.id ?? 'anon'), amount);
    await ctx.reply(r.text);
  }

  @Hears(/(transporte|streaming|mercado|restaurantes|sa[úu]de|lazer)/i)
  async pickCats(@Ctx() ctx: Context) {
    const raw = (ctx.message as any).text as string;
    // CORRIGIDO AQUI
    this.logger.log(`Comando 'pickCats' acionado por ${ctx.from?.id ?? 'ID_Desconhecido'} com texto: "${raw}"`);
    const cats = raw.toLowerCase().split(/[,;]| e /).map(s => s.trim()).filter(Boolean);
    if (!cats.length) return;
    const r = await this.messages.suggestionsForCategories(String(ctx.from?.id ?? 'anon'), cats);
    await ctx.reply(r.text);
  }

  @Hears(/^\s*limite\s+(.+?)\s+(\d+[\.,]?\d*)\s*$/i)
  async limit(@Ctx() ctx: Context) {
    const text = (ctx.message as any).text as string;
    // CORRIGIDO AQUI
    this.logger.log(`Comando 'limit' acionado por ${ctx.from?.id ?? 'ID_Desconhecido'} com texto: "${text}"`);
    const match = text.match(/^\s*limite\s+(.+?)\s+(\d+[\.,]?\d*)\s*$/i);
    if (!match) return ctx.reply('Use "limite <categoria/serviço> <valor>", ex.: "limite Uber 50"');
    const target = match[1].trim();
    const amount = Number(match[2].replace(',', '.'));
    const r = await this.messages.createLimit(String(ctx.from?.id ?? 'anon'), target, amount);
    await ctx.reply(r.text);
  }

  // Comando de análise de extrato com IA
  @Hears(['analise meu extrato', 'analisar extrato'])
  async analyzeStatement(@Ctx() ctx: Context) {
    // Já estava correto aqui
    const userId = String(ctx.from?.id ?? 'anon');
    this.logger.log(`Comando 'analyzeStatement' acionado por ${userId}`);
    await ctx.reply('Ok! Analisando seu extrato, isso pode levar um momento...');
    await ctx.replyWithChatAction('typing');

    try {
      const analysisResult = await this.statementService.getStatementAnalysis(userId);
      await ctx.reply(analysisResult);
    } catch (error) {
      this.logger.error('Erro no fluxo de análise de extrato', error);
      await ctx.reply('Desculpe, encontrei um erro ao tentar analisar seu extrato.');
    }
  }

  // Fallback conversacional com IA
  @On('text')
  async fallback(@Ctx() ctx: Context) {
    // Já estava correto aqui
    const text = (ctx.message as any)?.text;
    const userId = String(ctx.from?.id ?? 'anon');
    this.logger.log(`Fallback acionado por ${userId} com o texto: "${text}"`);

    try {
        await ctx.replyWithChatAction('typing');
        const response = await this.openaiService.getChatResponse(text, userId);
        await ctx.reply(response);
    } catch (error) {
        this.logger.error('Erro ao chamar a OpenAI no fallback:', error);
        await ctx.reply('Desculpe, não consegui processar sua pergunta no momento.');
    }
  }
}