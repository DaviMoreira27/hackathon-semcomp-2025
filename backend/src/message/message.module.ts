import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { PiggyModule } from '../piggy/piggy.module';
import { BudgetModule } from '../budget/budget.module';
import { OpenaiModule } from '../openai/openai.module';
import { StatementModule } from '../statement/statement.module';

@Module({
  imports: [
    PiggyModule,
    BudgetModule,     // <-- importa para disponibilizar BudgetService
    OpenaiModule,
    StatementModule,
  ],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}