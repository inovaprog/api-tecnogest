import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { Express, urlencoded, json } from 'express';
import { setNestGlobalConfig } from './lib/server/nest-server-config';

export async function createApp(
  expressApp: Express,
  logger?: any,
): Promise<INestApplication> {
  const options = {};
  if (logger) Object.assign(options, { logger: logger });
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    options,
  );
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  setNestGlobalConfig(app);
  return app;
}
