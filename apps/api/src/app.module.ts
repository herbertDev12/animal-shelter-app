import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.module';
import { AnimalsModule } from './modules/animal/animal.module';
import { ClinicsModule } from './modules/clinic/clinic.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ContractModule } from './modules/contract/contract.module';
import { TransportServiceModule } from './modules/transport-service/transport-service.module';
import { VeterinarianModule } from './modules/veterinarian/veterinarian.module';

@Module({
  imports: [
    DatabaseModule,
    AnimalsModule,
    ClinicsModule,
    SupplierModule,
    ReportsModule,
    ContractModule,
    TransportServiceModule,
    VeterinarianModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
