import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    try {
      // Verify the token with Supabase
      const { data: { user }, error } = await this.supabaseService
        .getServiceRoleClient()
        .auth.getUser(payload.sub);

      if (error || !user) {
        throw new UnauthorizedException('Invalid token');
      }

      return {
        userId: user.id,
        email: user.email,
        ...user.user_metadata,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
