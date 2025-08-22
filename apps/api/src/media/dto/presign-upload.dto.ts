import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum UploadKind {
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
}

export class PresignUploadDto {
  @IsEnum(UploadKind)
  kind!: UploadKind;

  @IsString()
  contentType!: string;

  @IsString()
  fileName!: string;

  @IsInt()
  @Min(1)
  @Max(200 * 1024 * 1024)
  size!: number;

  @IsOptional()
  @IsString()
  entryId?: string;
}
