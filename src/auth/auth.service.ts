import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName } = registerDto;

    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            },
          },
        });

      if (error) {
        if (error.message.includes('already registered')) {
          throw new ConflictException('User already exists');
        }
        throw new UnauthorizedException(error.message);
      }

      if (!data.user) {
        throw new UnauthorizedException('Registration failed');
      }

      const access_token = this.jwtService.sign(
        { sub: data.user.id, email: data.user.email },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
        },
      );

      return {
        access_token,
        user: {
          id: data.user.id,
          email: data.user.email ?? '',
          firstName: data.user.user_metadata?.first_name ?? firstName ?? '',
          lastName: data.user.user_metadata?.last_name ?? lastName ?? '',
        },
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Registration failed');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!data.user) {
        throw new UnauthorizedException('Login failed');
      }

      const access_token = this.jwtService.sign(
        { sub: data.user.id, email: data.user.email },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
        },
      );

      return {
        access_token,
        user: {
          id: data.user.id,
          email: data.user.email ?? '',
          firstName: data.user.user_metadata?.first_name ?? '',
          lastName: data.user.user_metadata?.last_name ?? '',
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Login failed');
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      await this.supabaseService.getClient().auth.signOut();
    } catch (error) {
      // Logout is best effort - don't throw errors
      console.error('Logout error:', error);
    }
  }

  async refreshToken(userId: string): Promise<{ access_token: string }> {
    try {
      const { data: { user }, error } = await this.supabaseService
        .getServiceRoleClient()
        .auth.getUser(userId);

      if (error || !user) {
        throw new UnauthorizedException('Invalid user');
      }

      const access_token = this.jwtService.sign(
        { sub: user.id, email: user.email },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
        },
      );

      return { access_token };
    } catch (error) {
      throw new UnauthorizedException('Token refresh failed');
    }
  }
}
