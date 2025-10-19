// src/statement/statement.module.ts
import { Module } from '@nestjs/common';
import { StatementService } from './statement.service';
import { OpenaiModule } from '../openai/openai.module';

@Module({
  imports: [OpenaiModule], // Importa o OpenaiModule para ter acesso ao serviço
  providers: [StatementService],
  exports: [StatementService], // Exporta o serviço para ser usado no TelegramUpdate
})
export class StatementModule {}