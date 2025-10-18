import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { HubWebhookQueryDTO, WhatsAppWebhookPayloadDTO } from './message.types';

@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get('webhook')
  authWebhook(@Query() query: HubWebhookQueryDTO) {
    const mode = query['hub.mode'];
    const challenge = query['hub.challenge'];
    const token = query['hub.verify_token'];

    return this.messageService.validateWebhook(mode, challenge, token);
  }

  @Post('webhook')
  async messageHandler(@Body() body: WhatsAppWebhookPayloadDTO) {
    this.messageService.processWhatsAppMessage(body);

    await this.messageService.processWhatsAppMessage(body);
  }
}
