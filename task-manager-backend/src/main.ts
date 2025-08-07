import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Enable CORS with specific options
  app.enableCors({
    origin: [
      'http://localhost:5173', // Vite default port
      'http://localhost:3001', // Alternative port
      'http://localhost:3000', // React default port
      'https://task-manager-frontend-harrison-nguyens-projects.vercel.app', // Your specific Vercel domain
      'https://task-manager-frontend-hmhngx-harrison-nguyens-projects.vercel.app',
      'https://task-manager-frontend-nu-two.vercel.app',
      process.env.FRONTEND_URL, // Environment variable
      // Allow any Vercel domain for this project
      /^https:\/\/.*\.vercel\.app$/,
    ].filter(Boolean),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          const constraints = error.constraints;
          if (constraints) {
            return Object.values(constraints)[0];
          }
          return 'Invalid input';
        });
        return new BadRequestException(messages.join(', '));
      },
    }),
  );

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('TaskFlow API')
    .setDescription('API for managing tasks with user authentication')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Serve static files from uploads directory
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  const port = process.env.PORT || 8080;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
void bootstrap();
