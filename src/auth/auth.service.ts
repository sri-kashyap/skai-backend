import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName } = registerDto;

    // Use Supabase Auth to sign up user
    const { data, error } = await this.supabaseService
      .getClient()
      .auth
      .signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new ConflictException('User with this email already exists');
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }

    if (!data.user) {
      throw new Error('Failed to create user');
    }

    // Generate JWT token
    const payload = { userId: data.user.id, email: data.user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: data.user.id,
        email: data.user.email || '',
        firstName: data.user.user_metadata?.first_name ?? firstName,
        lastName: data.user.user_metadata?.last_name ?? lastName,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Use Supabase Auth to sign in user
    const { data, error } = await this.supabaseService
      .getClient()
      .auth
      .signInWithPassword({
        email,
        password,
      });

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { userId: data.user.id, email: data.user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: data.user.id,
        email: data.user.email || '',
        firstName: data.user.user_metadata?.first_name || '',
        lastName: data.user.user_metadata?.last_name || '',
      },
    };
  }

  async logout(userId: string): Promise<void> {
    // In a more sophisticated implementation, you might want to:
    // 1. Add the token to a blacklist
    // 2. Update user's last logout time
    // 3. Clear any server-side sessions
    
    // For now, we'll just log the logout
    console.log(`User ${userId} logged out`);
  }

  async refreshToken(userId: string): Promise<{ access_token: string }> {
    // Get user details
    const { data: user, error } = await this.supabaseService
      .getServiceRoleClient()
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new JWT token
    const payload = { userId: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }
}

