import { PartialType } from '@nestjs/mapped-types';
import { User } from '../../../lib/typeorm/entities/user.entity';

export class UpdateUserDto extends PartialType(User) {}
