import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [],
  providers: [MessageService, ConfigService],
  controllers: [MessageController],
  exports: [],
})
export class MessageModule {}
