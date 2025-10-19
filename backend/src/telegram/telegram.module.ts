import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramUpdate } from './telegram.update';
import { MessageModule } from '../message/message.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN!,
      // polling é padrão; não precisamos passar launchOptions
    }),
    MessageModule,
  ],
  providers: [TelegramUpdate],
})
export class TelegramModule {}
