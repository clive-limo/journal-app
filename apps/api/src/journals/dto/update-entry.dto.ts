import { PartialType } from '@nestjs/mapped-types';
import { CreateEntryDto } from './create-entry.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateEntryDto extends PartialType(CreateEntryDto) {
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;
}
