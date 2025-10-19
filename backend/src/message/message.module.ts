import { Module } from '@nestjs/common';
import { MessageService } from './message.service';

@Module({
  providers: [MessageService],
  exports: [MessageService], // para o TelegramUpdate usar
})
export class MessageModule {}