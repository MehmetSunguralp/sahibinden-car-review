import 'dotenv/config';
import 'reflect-metadata';
import './utils/file.polyfill';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Server is listening at http://localhost:${port}`);
}

bootstrap(); // NOSONAR - top-level await not allowed by current TS module/target
