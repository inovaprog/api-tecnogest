import { Module } from '@nestjs/common';
import { UtilsController } from './utils.controller';
@Module({
  imports: [],
  controllers: [UtilsController],
  providers: [],
})
export class UtilsModule {}
