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
    const { userId, email } = payload;
    
    if (!userId || !email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Verify user still exists in Supabase Auth
    const { data: { user }, error } = await this.supabaseService
      .getServiceRoleClient()
      .auth
      .admin
      .getUserById(userId);

    if (error || !user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      userId: user.id,
      email: user.email,
      firstName: user.user_metadata?.first_name || '',
      lastName: user.user_metadata?.last_name || '',
    };
  }
}
