// src/openai/openai.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as openai from 'openai';
import { JSONSchema } from './openai.types';

@Injectable()
export class OpenaiService {
  private readonly model: string;
  private readonly openaiService: openai.OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.model = configService.get<string>('openaiModel')!;
    this.openaiService = new openai.OpenAI({
      apiKey: this.configService.get<string>('openaiKey')!
    });
  }

  async getOpenAIResponse<T>(prompt: string, jsonBody: JSONSchema<T>, user: string) {
    const client = this.openaiService;
    const completion = await client.chat.completions.create({
      model: this.model,
      temperature: 1,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_schema', json_schema: jsonBody },
    });

    const content = completion.choices?.[0]?.message?.content ?? '{}';

    console.log(content);
  }
}