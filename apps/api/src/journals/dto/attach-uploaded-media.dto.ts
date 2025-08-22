import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AttachUploadedMediaDto {
  @IsString()
  key!: string;

  @IsOptional()
  @IsString()
  thumbKey?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  width?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  height?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationS?: number;
}
