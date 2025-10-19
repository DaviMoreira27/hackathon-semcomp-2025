// app.module.ts (exemplo)
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from './config/config';
import { HttpModule } from '@nestjs/axios';

import { DatabaseModule } from './database/database.module';
import { BudgetModule } from './budget/budget.module';
import { PiggyModule } from './piggy/piggy.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { AlertModule } from './alert/alert.module';
import { MessageModule } from './message/message.module';
import { OpenaiModule } from './openai/openai.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    HttpModule.register({ timeout: 20000, maxRedirects: 5 }),
    DatabaseModule,
    BudgetModule,
    PiggyModule,
    SubscriptionModule,
    AlertModule,
    MessageModule,
    OpenaiModule,
    TelegramModule,
  ],
})
export class AppModule {}
