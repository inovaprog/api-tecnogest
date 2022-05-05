import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import { TracingInterceptor } from '../../interceptors/tracing.interceptor';
import { isServerlessOffline } from '../utils/environment';

export function setNestGlobalConfig(nestApp: INestApplication) {
  nestApp.setGlobalPrefix('v1');
  const interceptors = [new ResponseInterceptor()];
  if (!isServerlessOffline()) {
    interceptors.push(new TracingInterceptor());
  }
  nestApp.useGlobalInterceptors(...interceptors);
  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  nestApp.enableCors({
    maxAge: 86400,
  });
  setupSwagger(nestApp);
  nestApp.use(compression());
}

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Tecnogest V1')
    .setDescription('Tecnogest V1')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/docs', app, document);
}
