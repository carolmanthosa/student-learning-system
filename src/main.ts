import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Student Learning System API')
    .setDescription('API documentation for the Student Learning System')
    .setVersion('1.0')

    // JWT Authentication
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )

    // Tags
    .addTag('auth')
    .addTag('students')
    .addTag('courses')
    .addTag('assignments')
    .addTag('enrollments')

    .build();

  // Create Swagger document
  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger route
  SwaggerModule.setup('api/docs', app, document);

  // Start server
  await app.listen(3000);

  console.log('🚀 API running on http://localhost:3000');
  console.log('📚 Swagger docs at http://localhost:3000/api/docs');
}

bootstrap();