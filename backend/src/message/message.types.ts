import { IsString, ValidateNested, IsArray, IsOptional, IsNumber, IsBoolean, isBoolean } from 'class-validator';
import { Type } from 'class-transformer';


class MetadataDTO {
  @IsString()
  display_phone_number: string;

  @IsString()
  phone_number_id: string;
}

class ProfileDTO {
  @IsString()
  name: string;
}

class ContactDTO {
  @ValidateNested()
  @Type(() => ProfileDTO)
  profile: ProfileDTO;

  @IsString()
  wa_id: string;
}

class TextDTO {
  @IsString()
  body: string;
}

class ErrorDataDTO {
  @IsString()
  details: string;
}

class ImageDTO {
  @IsString()
  mime_type: string;

  @IsString()
  sha256: string;

  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  caption?: string;
}

class AudioDTO {
  @IsString()
  mime_type: string;

  @IsString()
  sha256: string;

  @IsString()
  id: string;

  @IsOptional()
  @IsBoolean()
  voice?: boolean;
}

class VideoDTO {
  @IsString()
  mime_type: string;

  @IsString()
  sha256: string;

  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  caption?: string;
}

class DocumentDTO {
  @IsString()
  mime_type: string;

  @IsString()
  sha256: string;

  @IsString()
  id: string;

  @IsString()
  filename: string;
}

class StickerDTO {
  @IsString()
  mime_type: string;

  @IsString()
  sha256: string;

  @IsString()
  id: string;

  @IsBoolean()
  @IsOptional()
  animated?: boolean;
}

class ErrorDTO {
  @IsNumber()
  code: number;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => ErrorDataDTO)
  error_data?: ErrorDataDTO;
}

export class MessageDTO {
  @IsString()
  from: string;

  @IsString()
  id: string;

  @IsString()
  timestamp: string;

  @IsString()
  // FIXME: Maybe change it to an ENUM
  type: 'text' | 'image' | 'audio' | 'video' | 'sticker' | 'document' | 'unsupported';

  @ValidateNested()
  @IsOptional()
  @Type(() => TextDTO)
  text?: TextDTO;

  @ValidateNested()
  @IsOptional()
  @Type(() => ImageDTO)
  image?: ImageDTO;

  @ValidateNested()
  @IsOptional()
  @Type(() => AudioDTO)
  audio?: AudioDTO;

  @ValidateNested()
  @IsOptional()
  @Type(() => VideoDTO)
  video?: VideoDTO;

  @ValidateNested()
  @IsOptional()
  @Type(() => StickerDTO)
  sticker?: StickerDTO;

  @ValidateNested()
  @IsOptional()
  @Type(() => DocumentDTO)
  document?: DocumentDTO;

  @ValidateNested()
  @IsOptional()
  @Type(() => Array<ErrorDTO>)
  errors?: ErrorDTO[];
}

class ValueDTO {
  @IsString()
  messaging_product: 'whatsapp';

  @ValidateNested()
  @Type(() => MetadataDTO)
  metadata: MetadataDTO;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactDTO)
  contacts: ContactDTO[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDTO)
  messages: MessageDTO[];
}

class ChangeDTO {
  @IsString()
  field: string;

  @ValidateNested()
  @Type(() => ValueDTO)
  value: ValueDTO;
}

class EntryDTO {
  @IsString()
  id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChangeDTO)
  changes: ChangeDTO[];
}

export class WhatsAppWebhookPayloadDTO {
  @IsString()
  object: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EntryDTO)
  entry: EntryDTO[];
}

// WEBHOOK QUERY PARAMS DTO

export class HubWebhookQueryDTO {
  @IsString()
  'hub.mode': string;

  @IsString()
  'hub.challenge': string;

  @IsString()
  'hub.verify_token': string;
}

// WhatsAppMapped

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  STICKER = 'sticker',
  DOCUMENT = 'document',
  UNSUPPORTED = 'unsupported',
}

export interface WhatsAppMessageMapped {
  metaMessageId: string;
  name: string;
  phoneNumber: string;
  text?: string;
  mediaId?: string;
  type: MessageType;
  sendedAt: Date;
}
