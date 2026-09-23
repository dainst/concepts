import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {GlobalExceptionFilter} from './filters/exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
