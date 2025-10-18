import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [])],
  providers: [MessageService, ConfigService],
  exports: [],
})
export class MessageModule {}
