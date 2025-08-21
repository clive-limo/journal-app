import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { prisma } from '@journal/database';
import { TokenService } from './services/token';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private tokenService: TokenService) {}

  async signout(userId: string) {
    try {
      await this.tokenService.revokeRefreshToken(userId);
      this.logger.log(`User ${userId} signed out successfully`);
      return { message: 'Signed out successfully' };
    } catch (error) {
      this.logger.error(`Failed to sign out user ${userId}:`, error);
      throw new BadRequestException('Failed to sign out');
    }
  }

  async validateGoogleUser(googleUser: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImage: string;
  }) {
    let user = await prisma.user.findUnique({
      where: { googleId: googleUser.googleId },
    });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {},
      });
      return user;
    }

    user = await prisma.user.findUnique({ where: { email: googleUser.email } });

    if (user) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.googleId,
          profileImage: googleUser.profileImage || user.profileImage,
          authProvider: 'google',
          firstName: user.firstName || googleUser.firstName,
          lastName: user.lastName || googleUser.lastName,
          fullName:
            user.fullName ||
            `${googleUser.firstName} ${googleUser.lastName}`.trim(),
        },
      });
      return updatedUser;
    }

    const newUser = await prisma.user.create({
      data: {
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        fullName: `${googleUser.firstName} ${googleUser.lastName}`.trim(),
        googleId: googleUser.googleId,
        profileImage: googleUser.profileImage,
        authProvider: 'google',
      },
    });

    return newUser;
  }

  async googleLogin(user: any) {
    return this.tokenService.generateTokens(user);
  }

  async validateRefreshToken(token: string) {
    return this.tokenService.validateRefreshToken(token);
  }

  async generateTokens(user: any) {
    return this.tokenService.generateTokens(user);
  }
}
