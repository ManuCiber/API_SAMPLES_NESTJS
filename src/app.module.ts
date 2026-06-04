import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SamplesModule } from './samples/samples.module';
import { VisitorsModule } from './visitors/visitors.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { InventoryLogsModule } from './inventory-logs/inventory-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    SamplesModule,
    VisitorsModule,
    DeliveriesModule,
    InventoryLogsModule,
  ],
})
export class AppModule {}
