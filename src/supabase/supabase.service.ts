import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import supabaseConfig from '../config/supabase.config';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(
    @Inject(supabaseConfig.KEY)
    private config: ConfigType<typeof supabaseConfig>,
  ) {
    if (!this.config.url || !this.config.anonKey || !this.config.serviceRoleKey) {
      throw new Error('Supabase URL, anonKey, and serviceRoleKey must be defined');
    }
    this.supabase = createClient(this.config.url, this.config.anonKey);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  getServiceRoleClient(): SupabaseClient {
    if (!this.config.url || !this.config.serviceRoleKey) {
      throw new Error('Supabase URL and serviceRoleKey must be defined');
    }
    return createClient(this.config.url, this.config.serviceRoleKey);
  }
}

