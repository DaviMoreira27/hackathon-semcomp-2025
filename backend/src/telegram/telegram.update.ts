import { Ctx, Hears, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { MessageService } from '../message/message.service';

@Update()
export class TelegramUpdate {
  constructor(private readonly messages: MessageService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.reply(
      'Olá! Sou seu assistente financeiro 💬\n' +
      'Comandos: "feche meu mês", "analisar onde economizar", "guardar 60 na caixinha".'
    );
  }

  // 1) Gatilhos ampliados para o relatório
  @Hears(['feche meu mês', 'feche meu mes', 'relatório', 'relatorio'])
  @Hears(/^\s*(relat[óo]rio|feche\s+meu\s+m[eê]s)\s*$/i)
  async monthly(@Ctx() ctx: Context) {
    console.log('>> monthly handler hit', { from: ctx.from?.id, text: (ctx.message as any)?.text });
    const r = await this.messages.monthlyReport(String(ctx.from?.id ?? 'anon'));
    await ctx.reply(r.text);
  }

  // 2) Planejar economia
  @Hears(['analisar onde economizar', 'economizar'])
  @Hears(/economizar|analisar\s+onde\s+economizar/i)
  async plan(@Ctx() ctx: Context) {
    console.log('>> plan handler hit', { text: (ctx.message as any)?.text });
    const r = await this.messages.askCategories(String(ctx.from?.id ?? 'anon'));
    await ctx.reply(r.text);
  }

  // 3) Guardar na caixinha
  @Hears(/(adicionar|guardar)\s*(\d+[\.,]?\d*)\s*(na\s+caixinha|caixinha)/i)
  async piggy(@Ctx() ctx: Context) {
    const text = (ctx.message as any).text as string;
    console.log('>> piggy match attempt', { text });
    const m = text.match(/(\d+[\.,]?\d*)/);
    const amount = m ? Number(m[1].replace(',', '.')) : 0;
    if (!amount) return ctx.reply('Qual valor? Ex.: "adicionar 100 na caixinha"');
    const r = await this.messages.addToPiggy(String(ctx.from?.id ?? 'anon'), amount);
    await ctx.reply(r.text);
  }

  // 4) Categorias (lista separada por vírgula, ponto e vírgula ou " e ")
  @Hears(/(transporte|streaming|mercado|restaurantes|sa[úu]de|lazer)/i)
  async pickCats(@Ctx() ctx: Context) {
    const raw = (ctx.message as any).text as string;
    console.log('>> pickCats raw', { raw });
    const cats = raw.toLowerCase().split(/[,;]| e /).map(s => s.trim()).filter(Boolean);
    if (!cats.length) return;
    const r = await this.messages.suggestionsForCategories(String(ctx.from?.id ?? 'anon'), cats);
    await ctx.reply(r.text);
  }

  // 5) Limite: "limite Uber 50"
  @Hears(/^\s*limite\s+(.+?)\s+(\d+[\.,]?\d*)\s*$/i)
  async limit(@Ctx() ctx: Context) {
    const text = (ctx.message as any).text as string;
    console.log('>> limit raw', { text });
    const match = text.match(/^\s*limite\s+(.+?)\s+(\d+[\.,]?\d*)\s*$/i);
    if (!match) return ctx.reply('Use "limite <categoria/serviço> <valor>", ex.: "limite Uber 50"');
    const target = match[1].trim();
    const amount = Number(match[2].replace(',', '.'));
    const r = await this.messages.createLimit(String(ctx.from?.id ?? 'anon'), target, amount);
    await ctx.reply(r.text);
  }

  // 6) Fallback: loga tudo para debugging
  @On('text')
  async fallback(@Ctx() ctx: Context) {
    const text = (ctx.message as any)?.text;
    console.log('>> Fallback text received:', JSON.stringify(text));
    await ctx.reply(
      'Não entendi 🤔 Tente:\n• "feche meu mês"\n• "analisar onde economizar"\n• "guardar 60 na caixinha"\n• "limite Uber 50"'
    );
  }
}