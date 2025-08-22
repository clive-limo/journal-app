import { IsOptional, IsDateString } from 'class-validator';

export class QueryRangeDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
