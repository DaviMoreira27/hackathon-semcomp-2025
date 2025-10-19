import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramUpdate } from './telegram.update';
import { MessageModule } from '../message/message.module';
import { OpenaiModule } from '../openai/openai.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StatementModule } from '../statement/statement.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN')!,
      }),
      inject: [ConfigService],
    }),
    MessageModule,
    OpenaiModule,
    StatementModule, // ✅ adicionado aqui (fora do forRootAsync)
  ],
  providers: [TelegramUpdate],
})
export class TelegramModule {}
