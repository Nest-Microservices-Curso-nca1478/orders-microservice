import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { envs } from './config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: envs.host,
        port: envs.port,
        retryAttempts: envs.retryAttempts || 5,
        retryDelay: envs.retryDelay || 3000,
      },
    },
  );

  await app.listen();

  logger.log(`Orders Microservice running on port ${envs.port}`);
}

bootstrap();
