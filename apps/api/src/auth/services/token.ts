import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '@journal/database';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h',
      issuer: 'journal-api',
    });

    const rawRefreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      issuer: 'journal-api',
    });

    const refreshHash = await bcrypt.hash(rawRefreshToken, 10);
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 3600 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshHash, refreshTokenExpiry },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: '3600',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        profileImage: user.profileImage,
      },
    };
  }

  async validateRefreshToken(raw: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(raw);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        fullName: true,
        profileImage: true,
        refreshToken: true,
        refreshTokenExpiry: true,
        deletedAt: true,
      },
    });
    if (
      !user ||
      user.deletedAt ||
      !user.refreshToken ||
      !user.refreshTokenExpiry ||
      user.refreshTokenExpiry <= new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const ok = await bcrypt.compare(raw, user.refreshToken);
    if (!ok)
      throw new UnauthorizedException('Invalid or expired refresh token');
    return user;
  }

  async revokeRefreshToken(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: null,
        refreshTokenExpiry: null,
        updatedAt: new Date(),
      },
    });
  }
}
