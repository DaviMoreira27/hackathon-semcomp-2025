import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [BudgetService],
  exports: [BudgetService],
})
export class BudgetModule {}
