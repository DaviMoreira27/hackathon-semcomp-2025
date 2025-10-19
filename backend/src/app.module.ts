import { Module } from '@nestjs/common';
import { MessageModule } from './message/message.module';
import { ConfigModule } from '@nestjs/config';
import config from './config/config';
import { HttpModule } from '@nestjs/axios';
import { OpenaiModule } from './openai/openai.module';
import { TelegramModule } from './telegram/telegram.module'; // ✅ já importado no topo

@Module({
  imports: [
    MessageModule,
    OpenaiModule,
    TelegramModule, // ✅ ADICIONE ESTA LINHA
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    HttpModule.register({
      timeout: 20000,
      maxRedirects: 5,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
