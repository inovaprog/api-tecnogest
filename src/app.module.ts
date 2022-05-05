import { Module } from '@nestjs/common';
import { UtilsModule } from './modules/utils/utils.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './lib/typeorm/connector/config.service';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    UtilsModule,
    UsersModule,
  ],
  providers: [],
})
export class AppModule {}
