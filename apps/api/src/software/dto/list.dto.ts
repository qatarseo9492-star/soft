import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class SoftwareListDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() os?: string;
  @IsOptional() @IsString() license?: string;

  @IsOptional() @IsString()
  sort?: 'updated' | 'new' | 'downloads';

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt() @Min(1) @Max(100)
  limit: number = 24;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt() @Min(1) @Max(1000)
  page: number = 1;
}