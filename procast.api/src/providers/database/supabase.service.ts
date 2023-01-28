import {Inject, Injectable, Scope} from "@nestjs/common";
import {createClient, SupabaseClient} from "@supabase/supabase-js";
import {REQUEST} from "@nestjs/core";
import {Request} from "express";
import {ConfigService} from "@nestjs/config";

@Injectable({ scope: Scope.REQUEST })
export class SupabaseService {
    private supabaseClient: SupabaseClient;

    constructor(
        @Inject(REQUEST) private readonly request: Request,
        private readonly configService: ConfigService
    ) {
    }

    getSupabaseClient(): SupabaseClient {
        if (this.supabaseClient) return this.supabaseClient;

        this.supabaseClient = createClient(
            this.configService.get('SUPABASE_URL'),
            this.configService.get('SUPABASE_KEY'),
            {
                auth: {
                    autoRefreshToken: true,
                    detectSessionInUrl: false
                }
            }
        );

        // to handle -> authorization.
        // this.supabaseClient.auth.signInWithPassword()
        // this.supabaseClient.auth.signInWithOAuth()
        return this.supabaseClient;
    }
}
