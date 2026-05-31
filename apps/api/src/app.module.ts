import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.module';
import { AnimalsModule } from './modules/animal/animal.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [DatabaseModule, AnimalsModule, ReportsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
