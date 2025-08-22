import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { makeS3 } from '../common/storage/s3.client';
import { PresignUploadDto, UploadKind } from './dto/presign-upload.dto';
import { v4 as uuidv4 } from 'uuid';
import { DateTime } from 'luxon';

const BUCKET = process.env.S3_BUCKET!;
const PUBLIC_BASE = process.env.S3_PUBLIC_BASE_URL!;

@Injectable()
export class MediaService {
  private s3 = makeS3();

  publicUrl(key: string) {
    return `${PUBLIC_BASE}/${key}`;
  }

  private extFromContentType(ct: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/heic': 'heic',
      'image/heif': 'heif',
      'audio/mpeg': 'mp3',
      'audio/mp3': 'mp3',
      'audio/wav': 'wav',
      'audio/webm': 'webm',
      'audio/ogg': 'ogg',
      'audio/mp4': 'm4a',
      'audio/x-m4a': 'm4a',
    };
    return map[ct] || 'bin';
  }

  private validate(dto: PresignUploadDto) {
    const allowImages = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
    ];
    const allowAudio = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/webm',
      'audio/ogg',
      'audio/mp4',
      'audio/x-m4a',
    ];
    const maxImage =
      Number(process.env.UPLOAD_MAX_IMAGE_MB || 15) * 1024 * 1024;
    const maxAudio =
      Number(process.env.UPLOAD_MAX_AUDIO_MB || 50) * 1024 * 1024;

    if (dto.kind === UploadKind.IMAGE) {
      if (!allowImages.includes(dto.contentType))
        throw new BadRequestException('Unsupported image type');
      if (dto.size > maxImage) throw new BadRequestException('Image too large');
    } else {
      if (!allowAudio.includes(dto.contentType))
        throw new BadRequestException('Unsupported audio type');
      if (dto.size > maxAudio) throw new BadRequestException('Audio too large');
    }
  }

  private buildKey(userId: string, kind: UploadKind, ext: string) {
    const d = DateTime.now();
    const id = uuidv4().replace(/-/g, '');
    const folder = kind === UploadKind.IMAGE ? 'images' : 'audio';
    return `media/u_${userId}/${d.toFormat('yyyy/LL/dd')}/${id}/original.${ext}`;
  }

  private userIdFromKey(key: string) {
    const m = key.match(/^media\/u_([^/]+)\//);
    return m?.[1] || null;
  }

  async presignPut(userId: string, dto: PresignUploadDto) {
    this.validate(dto);

    const ext = this.extFromContentType(dto.contentType);
    const key = this.buildKey(userId, dto.kind, ext);

    const cmd = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: dto.contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, cmd, { expiresIn: 60 * 5 });

    return {
      method: 'PUT',
      uploadUrl,
      key,
      publicUrl: this.publicUrl(key),
      expiresIn: 300,
      headers: { 'Content-Type': dto.contentType },
    };
  }

  async resolveUploadedObject(userId: string, key: string) {
    const ownerFromKey = this.userIdFromKey(key);
    if (!ownerFromKey || ownerFromKey !== userId) {
      throw new ForbiddenException('Ownership mismatch');
    }

    const head = await this.s3
      .send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }))
      .catch(() => {
        throw new BadRequestException('Object not found');
      });

    return {
      key,
      url: this.publicUrl(key),
      size: Number(head.ContentLength || 0),
      contentType: head.ContentType || null,
    };
  }
}
