import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { prisma } from '@journal/database';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
      issuer: 'journal-api',
    });
  }

  async validate(payload: any){
    const user = await prisma.user.findUnique({
      where: { id: payload.sub, deletedAt: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        fullName: true,
        profileImage: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!user) throw new UnauthorizedException('User not found');
    if (!user.isActive)
      throw new UnauthorizedException('Account is deactivated');
    return user;
  }
}
