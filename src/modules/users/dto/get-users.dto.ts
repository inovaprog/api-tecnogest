import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetUsersDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ each: true })
    @IsNotEmpty()
    id: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ each: true })
    @IsNotEmpty()
    name: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ each: true })
    @IsNotEmpty()
    email: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ each: true })
    @IsNotEmpty()
    plan: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    parentId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ each: true })
    @IsNotEmpty()
    companyId: string[];


    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    page: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    limit: number;
}