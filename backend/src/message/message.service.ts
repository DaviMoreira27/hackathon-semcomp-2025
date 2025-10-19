import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageService {
  async monthlyReport(userId: string) {
    // mock — troque pelos seus dados / analyzer depois
    return {
      text:
        '📊 Relatório de Outubro\n' +
        '• Total: R$ 3.240 (+6% vs. Set)\n' +
        '• Top: Mercado 30%, Restaurantes 13%, Transporte 11%\n' +
        'Quer *adicionar na caixinha* ou *analisar onde economizar*?',
    };
  }

  async askCategories(userId: string) {
    return {
      text:
        'Quais categorias você gostaria de reduzir?\nCategorias: Mercado, Restaurantes, Transporte, Streaming, Saúde, Lazer.',
    };
  }

  async suggestionsForCategories(userId: string, cats: string[]) {
    const lines = cats.map((c) => `• ${c}: sugerir definir limite ou cancelar assinatura (se existir).`);
    return { text: `Sugestões:\n${lines.join('\n')}\nDeseja criar limite ou adicionar aviso de cancelamento?` };
  }

  async createCancelAlert(userId: string, service: string) {
    return { text: `🔔 Aviso de cancelamento criado para ${service}.` };
  }

  async createLimit(userId: string, target: string, value: number) {
    return { text: `✅ Limite criado: ${target} = R$ ${value} (alerta 80%/100%).` };
  }

  async addToPiggy(userId: string, amount: number) {
    // mock saldo
    const total = 760 + amount;
    return { text: `💰 Adicionados R$ ${amount} à caixinha. Total: R$ ${total}.` };
  }
}
