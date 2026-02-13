import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const originEnv = process.env.FRONTEND_ORIGIN;
  app.enableCors({
    origin: originEnv
      ? originEnv.split(',').map((value) => value.trim())
      : true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
