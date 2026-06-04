import { Module } from '@nestjs/common';
import { InventoryLogsService } from './inventory-logs.service';
import { InventoryLogsController } from './inventory-logs.controller';

@Module({
  controllers: [InventoryLogsController],
  providers: [InventoryLogsService],
  exports: [InventoryLogsService],
})
export class InventoryLogsModule {}
