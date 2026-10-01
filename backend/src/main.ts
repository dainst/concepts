import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {GlobalExceptionFilter} from './filters/exception.filter';
import {EnvironmentService} from './services/environment/environment.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const es = app.get(EnvironmentService);

  app.useGlobalFilters(new GlobalExceptionFilter());
  if (es.get().cors) app.enableCors();
  await app.listen(es.get().port);
}
void bootstrap();
