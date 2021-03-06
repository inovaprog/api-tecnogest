import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  password: string;
}
