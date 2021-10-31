import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { StorageConfig } from 'cfg/storage.cfg';
import { ValidationPipe } from '@nestjs/common';
import { ArgumentOutOfRangeError } from 'rxjs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(StorageConfig.photo.destination,{prefix: StorageConfig.photo.urlPrefix,maxAge: StorageConfig.photo.maxAge,index: false});

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors();
  await app.listen(3000);
}
bootstrap();
