import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MediaService } from './media.service';
import { PresignUploadDto } from './dto/presign-upload.dto';

@ApiTags('Media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post('presign')
  @ApiOperation({ summary: 'Create a presigned PUT URL for S3' })
  @ApiBody({ type: PresignUploadDto })
  presign(@CurrentUser() user: any, @Body() dto: PresignUploadDto) {
    return this.media.presignPut(user.id, dto);
  }
}
