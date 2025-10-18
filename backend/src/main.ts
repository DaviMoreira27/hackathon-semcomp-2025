import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { ValidationAppError } from './global/errors/global.errors';
import { HttpExceptionFilter } from './global/filters/global.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      logLevels: ['error', 'log', 'debug'],
      json: true,
    }),
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      // TODO: Handle better validation errors
      exceptionFactory: (errors) => {
        const arrayErrors = (errors.map((err) => Object.values(err.constraints || {})).flat()).join('-');
        throw new ValidationAppError(arrayErrors);
      }
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
