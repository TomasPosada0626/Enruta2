import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SWAGGER_PATH = 'docs';

/** Publica la documentación OpenAPI en /docs (y el JSON en /docs-json). */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Enruta2 API')
    .setDescription(
      'Rutas escolares: optimización de paradas, recorridos en vivo y notificaciones.',
    )
    .setVersion('0.1.0')
    .build();

  SwaggerModule.setup(SWAGGER_PATH, app, SwaggerModule.createDocument(app, config));
}
