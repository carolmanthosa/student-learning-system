import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Student Learning System API')
    .setDescription('API documentation for the Student Learning System')
    .setVersion('1.0')
    .addTag('students')
    .addTag('courses')
    .addTag('assignments')
    .addTag('enrollments')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log('🚀 API running on http://localhost:3000');
  console.log('📚 Swagger docs at http://localhost:3000/api/docs');
}
bootstrap();