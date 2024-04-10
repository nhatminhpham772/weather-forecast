import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv'
import { setupSwagger } from './config/sections/openapi.config';
import { setupApp } from './config/sections/app.config';
dotenv.config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await setupApp(app)
  await setupSwagger(app)
  await app.listen(3000);
}
bootstrap();
