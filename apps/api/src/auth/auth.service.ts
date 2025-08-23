import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '@journal/database';
import { TokenService } from './services/token';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private tokenService: TokenService) {}

  async getUserById(id: string, includeJournal = false) {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          fullName: true,
          profileImage: true,
          authProvider: true,
          googleId: true,
          journals: includeJournal
            ? {
                take: 1,
                orderBy: { createdAt: 'asc' },
                include: {
                  _count: {
                    select: { entries: true },
                  },
                },
              }
            : false,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      if (includeJournal) {
        const { journals, ...userData } = user;
        return {
          ...userData,
          defaultJournal: journals?.[0] || null,
        };
      }

      return user;
    } catch (error) {
      this.logger.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  }

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
    this.logger.log(`Validating Google user: ${googleUser.email}`);

    let user = await prisma.user.findUnique({
      where: { googleId: googleUser.googleId },
    });

    if (user) {
      this.logger.log(`Found existing user by googleId: ${user.id}`);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          updatedAt: new Date(),
        },
      });

      const hasJournal = await prisma.journal.findFirst({
        where: { ownerId: user.id },
      });

      if (!hasJournal) {
        this.logger.log(`User ${user.id} has no journal, creating default...`);
        await this.createDefaultJournal(user.id, user.firstName || undefined);
      }

      return user;
    }

    user = await prisma.user.findUnique({ where: { email: googleUser.email } });

    if (user) {
      this.logger.log(
        `Found existing user by email, linking Google: ${user.id}`,
      );
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
          updatedAt: new Date(),
        },
      });

      const hasJournal = await prisma.journal.findFirst({
        where: { ownerId: updatedUser.id },
      });

      if (!hasJournal) {
        this.logger.log(
          `User ${updatedUser.id} has no journal, creating default...`,
        );
        await this.createDefaultJournal(
          updatedUser.id,
          updatedUser.firstName || undefined,
        );
      }

      return updatedUser;
    }

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
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

      const journal = await tx.journal.create({
        data: {
          ownerId: newUser.id,
          title: `${newUser.firstName}'s Journal`,
        },
      });

      const currentMonth = new Date().toISOString().slice(0, 7);
      const streak = await tx.streak.create({
        data: {
          userId: newUser.id,
          currentStreak: 0,
          longestStreak: 0,
          totalEntries: 0,
          monthlyCount: 0,
          currentMonth,
        },
      });

      this.logger.log(
        `New user created with defaults: ${newUser.id}, journal: ${journal.id}`,
      );
      return { user: newUser, journal, streak };
    });

    return result.user;
  }

  async googleLogin(user: any) {
    if (!user || !user.id) {
      throw new BadRequestException('Invalid user data from Google');
    }

    this.logger.log(`Generating tokens for user: ${user.id}`);
    return this.tokenService.generateTokens(user);
  }

  async validateRefreshToken(token: string) {
    return this.tokenService.validateRefreshToken(token);
  }

  async generateTokens(user: any) {
    return this.tokenService.generateTokens(user);
  }

  private async createDefaultJournal(userId: string, userFirstName?: string) {
    try {
      const journalTitle = userFirstName
        ? `${userFirstName}'s Journal`
        : 'My Journal';

      const journal = await prisma.journal.create({
        data: {
          ownerId: userId,
          title: journalTitle,
        },
      });

      const existingStreak = await prisma.streak.findUnique({
        where: { userId },
      });

      if (!existingStreak) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        await prisma.streak.create({
          data: {
            userId,
            currentStreak: 0,
            longestStreak: 0,
            totalEntries: 0,
            monthlyCount: 0,
            currentMonth,
          },
        });
      }

      return journal;
    } catch (error) {
      this.logger.error(
        `Failed to create default journal for user ${userId}:`,
        error,
      );
      throw error;
    }
  }
}
