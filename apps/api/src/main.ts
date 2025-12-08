import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('ZeroDayInstitute API')
    .setDescription('API documentation for ZeroDayInstitute.com')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Provide a simple root route so GET / does not return 404 in the browser.
  // Redirect to API docs or the API prefix depending on what the developer prefers.
  try {
    const server: any = app.getHttpAdapter().getInstance();
    const rootPath = '/';
    const apiPrefix = `/${process.env.API_PREFIX || 'api/v1'}`;
    server.get(rootPath, (req: any, res: any) => {
      // Prefer docs if available
      return res.redirect('/api/docs');
    });
  } catch (e) {
    // If platform doesn't expose an instance, skip adding the redirect.
    console.warn('Could not attach root redirect handler', e);
  }

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 API running on http://localhost:${port}`);
}

bootstrap();
