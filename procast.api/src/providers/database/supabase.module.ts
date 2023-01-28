import {Module} from "@nestjs/common";
import {SupabaseService} from "./supabase.service";
import {SupabaseStrategy} from "./supabase.strategy";
import {ConfigService} from "@nestjs/config";
import {SupabaseGuard} from "./supabase.guard";
import {PrismaService} from "../../../prisma/prisma.service";

@Module({
    providers: [SupabaseService, SupabaseStrategy, SupabaseGuard, ConfigService, PrismaService],
    exports: [SupabaseService, SupabaseStrategy, SupabaseGuard]
})
export class SupabaseModule {
}
