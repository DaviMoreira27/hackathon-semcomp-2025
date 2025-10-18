import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InvalidWebhookToken, UnsupportedMessageReceived } from 'src/message/message.errors';
import { MessageDTO, WhatsAppMessageMapped, WhatsAppWebhookPayloadDTO } from './message.types';

@Injectable()
export class MessageService {
  private readonly verifyToken: string;

  constructor(
    @Inject(ConfigService)
    private configService: ConfigService,
  ) {
    this.verifyToken = this.configService.get<string>('whatsappVerifyToken', '');
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

    const blocking = await this.blockingDuplicatedMessages(message.metaMessageId);
    if (blocking) {
      console.log('Message already processed');
      return;
    }

    const chat = await this.getConversation(message);

    const newMessage = this.messagesRepository.create({
      conversation: chat,
      text: message.text,
      meta_message_id: message.metaMessageId,
      meta_media_id: message.mediaId,
      type: message.type
    });

    await this.messagesRepository.createQueryBuilder().insert().into(Messages).values(newMessage).orIgnore().execute();
    console.log('Message saved');
  }

  private async getConversation(message: WhatsAppMessageMapped) {
    const getActiveConversations = await this.conversationsRepository.findOne({
      where: {
        status: In([ConversationStatus.ONGOING, ConversationStatus.STARTED]),
        contact: { meta_contact_id: message.phoneNumber },
      },
    });

    if (getActiveConversations && getActiveConversations?.status === ConversationStatus.STARTED) {
      getActiveConversations.status = ConversationStatus.ONGOING;
      this.conversationsRepository.save(getActiveConversations);
    }

    const isExpired =
      getActiveConversations?.created_at &&
      Date.now() - new Date(getActiveConversations.created_at).getTime() >= 2 * 60 * 60 * 1000; // >= 2 hours

    if (getActiveConversations && !isExpired) {
      return getActiveConversations;
    }

    if (isExpired) {
     getActiveConversations.status = ConversationStatus.FINALIZED;
     this.conversationsRepository.save(getActiveConversations);
    }

    const messageObjective = this.getMessageObjective(message);
    const getContact = await this.getContactEntity(message.name, message.phoneNumber);

    const newConversation = this.conversationsRepository.create({
      contact: getContact,
      type: messageObjective,
      status: ConversationStatus.STARTED,
      // TODO: #9 Add logic to retrieve the conversation subject
      /*
        When the user sends the first message, i will check if there is any conversation open, if so, i will use that.

        If not, i need to send a pre-made message that will contain the conversation type (subject or config):
          - If the user chooses config, then i will send another message that contains all the options that he can choose. When he responds to that, I will update the
          subject field with the option choosed.
          - If he chooses subject, then i will send a list with all the subject registered, when he pick an option, then i will update this conversation with the picked subject
      */
    });

    return await this.conversationsRepository.save(newConversation);
  }

  private async blockingDuplicatedMessages(metaMessageId: string) {
    const getMessages = await this.messagesRepository.findOne({ where: {
      meta_message_id: metaMessageId
    }});

    if (getMessages) {
      return true;
    }

    return false;
  }

  private async getContactEntity(name: string, phoneNumber: string) {
    const getContact = await this.contactsRepository.findOne({ where: {
      meta_contact_id: phoneNumber
    }});

    if (getContact) {
      return getContact;
    }

    const newContact = this.contactsRepository.create({
      name: name,
      meta_contact_id: phoneNumber
    });

    await this.contactsRepository.createQueryBuilder().insert().into(Contacts).values(newContact).orIgnore().execute();
  }

  private getMessageObjective(message: WhatsAppMessageMapped) {
    const type = message.type;
    const text = message.text;

    if (type === MessageType.UNSUPPORTED) {
      throw new UnsupportedMessageReceived('MESSAGE_OBJECTIVE_UNSUPPORTED');
    }

    if (type === MessageType.TEXT && text && text.includes('CONFIG')) {
      return ConversationType.CONFIG;
    }

    return ConversationType.SUBJECT;
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
