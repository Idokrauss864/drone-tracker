import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

app.use(helmet());
app.enableCors({
  origin: true,
  credentials: true,
});

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    transform: true,   
  }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Drone Tracker API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  const config = new DocumentBuilder()
  .setTitle('Drones Tracker API')
  .setDescription('Drones generator + WebSocket live updates')
  .setVersion('1.0')
  .addTag('drones')
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const cfg = app.get(ConfigService);
  const port = cfg.get<number>('PORT') ?? 3000;
  await app.listen(port);
}
bootstrap();
