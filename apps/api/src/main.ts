import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import type { Env } from './config/env.js';
import { setupSwagger } from './swagger.js';

const app = await NestFactory.create(AppModule, { bufferLogs: true });
app.useLogger(app.get(Logger));
app.enableShutdownHooks();

const config = app.get<ConfigService<Env, true>>(ConfigService);
if (config.get('NODE_ENV', { infer: true }) !== 'production') {
  setupSwagger(app);
}

await app.listen(config.get('PORT', { infer: true }));
