import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
 
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    plan: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    dateOfBirth: string;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    phone: string;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    street: string;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    number: string;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    neighborhood: string;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    city: string;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    state: string;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    country: string;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    zip: string;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    complement: string;
}
