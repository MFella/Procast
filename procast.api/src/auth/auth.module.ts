import {Module} from "@nestjs/common";
import {PassportModule} from "@nestjs/passport";
import {SupabaseStrategy} from "../providers/database/supabase.strategy";
import { JwtModule } from '@nestjs/jwt';
import {JwtStrategy} from "./jwt.strategy";
import {base64Secret} from "../config/configuration";
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import {PrismaService} from "../../prisma/prisma.service";
import {SupabaseModule} from "../providers/database/supabase.module";
import {ConfigService} from "@nestjs/config";


@Module({
    imports: [
        PassportModule,
        SupabaseModule,
        JwtModule.register({
            secret: base64Secret,
            signOptions: { expiresIn: '60s'}
        })
    ],
    providers: [
        ConfigService,
        PrismaService,
        AuthService,
        SupabaseStrategy,
        JwtStrategy
    ],
    controllers: [AuthController]
})
export class AuthModule {}
