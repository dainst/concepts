import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { StatusController } from './status/status.controller';
import { DbService } from './db/db.service';
import { ConceptController } from './concept/concept.controller';

@Module({
  imports: [],
  controllers: [AppController, StatusController, ConceptController],
  providers: [DbService],
})
export class AppModule {}
