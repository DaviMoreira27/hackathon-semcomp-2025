// src/openai/openai.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai'; // 1. Importação principal simplificada
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions'; // 2. Importação de tipo mais específica
import {JSONSchema} from './openai.types';

@Injectable()
export class OpenaiService {
  private readonly model: string;
  private readonly openaiService: OpenAI; // 3. Usando o tipo importado diretamente
  private readonly logger = new Logger(OpenaiService.name);

  constructor(private readonly configService: ConfigService) {
    this.model = configService.get<string>('OPENAI_MODEL')!;
    const apiKey = configService.get<string>('OPENAI_KEY')!;

    if (!apiKey) this.logger.error('!!! OPENAI_KEY não foi encontrada no .env !!!');
    if (!this.model) this.logger.error('!!! OPENAI_MODEL não foi encontrado no .env !!!');

    this.openaiService = new OpenAI({
      apiKey: apiKey,
    });
  }

  async getOpenAIResponse<T>(prompt: string, jsonBody: JSONSchema<T>, userText: string) {
    this.logger.log(`Gerando resposta JSON para o texto: "${userText}"`);

    const completion = await this.openaiService.chat.completions.create({
      model: this.model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: userText },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices?.[0]?.message?.content ?? '{}';
    this.logger.log('Conteúdo bruto da OpenAI (JSON):', content);
    
    try {
      return JSON.parse(content) as T;
    } catch (error) {
      this.logger.error('Falha ao parsear a resposta JSON da OpenAI', error);
      throw new Error('Resposta inválida da OpenAI');
    }
  }

  async getChatResponse(userMessage: string, userId: string): Promise<string> {
    this.logger.log(`Gerando resposta de chat para o usuário ${userId}: "${userMessage}"`);

    // 4. Código duplicado removido para maior clareza
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `
          Você é um assistente financeiro pessoal especializado em finanças domésticas e investimentos no Brasil.
          Suas respostas devem ser claras, práticas e sempre contextualizadas com o perfil de uma pessoa comum.
          Dê dicas como:
          - "Você pode gastar menos em restaurantes e aplicar no CDI"
          - "Reduza gastos com streaming e invista em Tesouro Selic"
          Seja educado, empático e direto. Evite respostas genéricas.
        `,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ];

    try {
        const completion = await this.openaiService.chat.completions.create({
            model: this.model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 300,
            user: userId,
        });

        return completion.choices?.[0]?.message?.content ?? 'Desculpe, não consegui gerar uma resposta.';
    } catch (error) {
        this.logger.error(`Erro ao buscar resposta da OpenAI para o usuário ${userId}`, error);
        throw error;
    }
  }
  
  async getStatementAnalysis(transactionsText: string): Promise<string> {
    this.logger.log(`Gerando análise de extrato...`);

    const prompt = `
      Você é um analista financeiro especialista. Analise a seguinte lista de transações de um extrato bancário.
      Sua resposta deve ser amigável, clara e em português do Brasil, usando R$ para valores monetários.
      
      Siga exatamente esta estrutura:
      1.  **Resumo Geral:** Comece com uma frase resumindo os gastos do período.
      2.  **Top 3 Categorias de Gastos:** Identifique as 3 categorias onde o usuário mais gastou e liste-as com seus totais.
      3.  **Sugestão de Economia:** Ofereça uma sugestão prática e acionável baseada no maior gasto.
      4.  **Ponto Positivo:** Encontre algo positivo, como um investimento, rendimento ou um dia de poucos gastos, e elogie o usuário.
    `;

    try {
      const completion = await this.openaiService.chat.completions.create({
        model: this.model,
        temperature: 0.5,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: transactionsText },
        ],
      });

      return completion.choices?.[0]?.message?.content ?? 'Não consegui analisar seu extrato no momento.';
    } catch (error) {
      this.logger.error(`Erro ao analisar extrato com OpenAI`, error);
      throw error;
    }
  }
}