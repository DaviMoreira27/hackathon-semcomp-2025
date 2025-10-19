import { Module } from '@nestjs/common';
import { PiggyService } from './piggy.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [PiggyService],
  exports: [PiggyService],
})
export class PiggyModule {}
