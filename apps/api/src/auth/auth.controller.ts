import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  Req,
  Res,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthResponseDto } from './dto/auth-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    const user = await this.authService.validateRefreshToken(
      refreshTokenDto.refreshToken,
    );
    return this.authService.generateTokens(user);
  }

  @Post('signout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign out current user' })
  @ApiResponse({
    status: 200,
    description: 'User signed out successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async signout(@CurrentUser() user: any) {
    const userId = user.id || user.sub;
    if (!userId) {
      throw new BadRequestException('User ID not found');
    }
    await this.authService.signout(userId);
    return { message: 'User signed out successfully' };
  }

  // Google Auth
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google OAuth consent screen',
  })
  async googleAuth(@Req() req: Request) {}

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend with auth token',
  })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const state = (req.query?.state as string) || '';
    try {
      const authResult = await this.authService.googleLogin(user);
      const frontendUrl = process.env.FRONTEND_URL!;
      const redirectUrl =
        `${frontendUrl}/auth/callback?token=${authResult.accessToken}` +
        (state ? `&state=${encodeURIComponent(state)}` : '');
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google auth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL!;
      return res.redirect(
        `${frontendUrl}/auth/error?message=` +
          encodeURIComponent('Authentication failed'),
      );
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile (by access token)' })
  @ApiResponse({ status: 200, description: 'Returns the current user' })
  @HttpCode(200)
  async me(@Req() req: Request) {
    const user = req.user as any;
    const userId = user.id || user.sub;

    if (!userId) {
      throw new BadRequestException('User not found in token');
    }

    const userData = await this.authService.getUserById(userId, true);
    return userData;
  }
}
