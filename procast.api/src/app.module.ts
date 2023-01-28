import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {SupabaseModule} from "./providers/database/supabase.module";
import {ConfigModule} from "@nestjs/config";
import configuration from "./config/configuration";
import {AuthModule} from "./auth/auth.module";
import {PrismaService} from "../prisma/prisma.service";

@Module({
  imports: [
    SupabaseModule,
    ConfigModule.forRoot({
      load: [configuration]
    }),
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
