import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InvalidWebhookToken, UnsupportedMessageReceived } from 'src/message/message.errors';
import { MessageDTO, MessageType, WhatsAppMessageMapped, WhatsAppWebhookPayloadDTO } from './message.types';

@Injectable()
export class MessageService {
  private readonly verifyToken: string;
  public messageMap!: WhatsAppMessageMapped[];

  constructor(
    @Inject(ConfigService)
    private configService: ConfigService,
  ) {
    this.verifyToken = this.configService.get<string>('whatsappVerifyToken')!;
  }

  validateWebhook(mode: string, challenge: string, token: string): string {
    if (mode === 'subscribe' && token === this.verifyToken) {
      console.log('Webhook authenticated');
      return challenge;
    }
    throw new InvalidWebhookToken('VALIDATE_WEBHOOK');
  }

  async processWhatsAppMessage(payload: WhatsAppWebhookPayloadDTO) {
    const message = await this.mapMessage(payload);

    this.messageMap.push({
      text: message.text,
      metaMessageId: message.metaMessageId,
      mediaId: message.mediaId,
      name: message.name,
      type: message.type,
      phoneNumber: message.phoneNumber,
      sendedAt: new Date(),
    });
    console.log('Message saved');
  }

  private async mapMessage(payload: WhatsAppWebhookPayloadDTO) {
    const entry = payload.entry?.[0];
    if (!entry) {
      console.warn('Payload does not contain any entry.');
      throw new UnsupportedMessageReceived('MAP_MESSAGE_ENTRY');
    }

    const change = entry.changes?.[0];
    if (!change) {
      console.warn('Entry does not contain any changes.');
      throw new UnsupportedMessageReceived('MAP_MESSAGE_CHANGE');
    }

    const value = change.value;
    if (!value) {
      console.warn('Change does not contain a value.');
      throw new UnsupportedMessageReceived('MAP_MESSAGE_VALUE');
    }

    const contact = value.contacts?.[0];
    const message = value.messages?.[0];

    if (!message) {
      console.warn('Value does not contain a message.');
      throw new UnsupportedMessageReceived('MAP_MESSAGE_VALUE');
    }

    const mappedMessage: WhatsAppMessageMapped = {
      metaMessageId: message.id,
      name: contact.profile.name,
      phoneNumber: message.from,
      type: message.type as MessageType,
      sendedAt: new Date(parseInt(message.timestamp, 10) * 1000), // The whatsApp timestamp is in Unix format
    };

    this.setMessageBody(mappedMessage, message);

    return mappedMessage;
  }

  private setMessageBody(mappedMessage: WhatsAppMessageMapped, receivedMessage: MessageDTO) {
    switch (receivedMessage.type) {
      case 'text':
        mappedMessage.text = receivedMessage.text?.body;
        break;
      case 'image':
        mappedMessage.mediaId = receivedMessage.image?.id;
        mappedMessage.text = receivedMessage.image?.caption;
        break;
      case 'audio':
        mappedMessage.mediaId = receivedMessage.audio?.id;
        break;
      case 'video':
        mappedMessage.mediaId = receivedMessage.video?.id;
        mappedMessage.text = receivedMessage.video?.caption;
        break;
      case 'sticker':
        mappedMessage.mediaId = receivedMessage.sticker?.id;
        break;
      case 'document':
        mappedMessage.mediaId = receivedMessage.document?.id;
        mappedMessage.text = receivedMessage.document?.filename;
        break;
      case 'unsupported':
        throw new UnsupportedMessageReceived('MESSAGE_BODY_UNSUPPORTED');
      default:
        throw new UnsupportedMessageReceived('MESSAGE_BODY_DEFAULT');
    }
  }
}
