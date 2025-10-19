// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // <-- Importação principal
import { DatabaseModule } from './database/database.module';
import { MessageModule } from './message/message.module';
import { OpenaiModule } from './openai/openai.module';
import { TelegramModule } from './telegram/telegram.module';
import { BudgetModule } from './budget/budget.module';
import { PiggyModule } from './piggy/piggy.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { AlertModule } from './alert/alert.module';
import { StatementModule } from './statement/statement.module';

@Module({
  imports: [
    // 1. O ConfigModule DEVE ser o primeiro da lista.
    //    A opção isGlobal: true faz com que as variáveis do .env
    //    fiquem disponíveis para todos os outros módulos sem
    //    precisar importar o ConfigModule em cada um deles.
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Todos os outros módulos vêm DEPOIS.
    DatabaseModule,
    MessageModule,
    OpenaiModule,
    TelegramModule,
    BudgetModule,
    PiggyModule,
    SubscriptionModule,
    AlertModule,
    StatementModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}