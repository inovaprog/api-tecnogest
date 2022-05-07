import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CustomUserRepository } from '../../lib/typeorm/repositories/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CustomUserRepository])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
