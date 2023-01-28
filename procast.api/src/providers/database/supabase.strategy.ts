import {PassportStrategy} from "@nestjs/passport";
import {SupabaseAuthStrategy} from "nestjs-supabase-auth";
import {Injectable} from "@nestjs/common";
import {ExtractJwt} from "passport-jwt";
import {ConfigService} from "@nestjs/config";
import {SupabaseConfig} from "../../config/configuration";

@Injectable()
export class SupabaseStrategy extends PassportStrategy(SupabaseAuthStrategy, 'supabase'){

    public constructor(
        private readonly configService: ConfigService
    ) {
        const supabaseConfig: SupabaseConfig = configService.get('supabaseConfig');
        super({
            supabaseUrl: supabaseConfig.SUPABASE_URL,
            supabaseKey: supabaseConfig.SUPABASE_PASSWORD,
            supabaseOptions: {},
            supabaseJwtSecret: supabaseConfig.SUPABASE_JWT_SECRET,
            extractor: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate(payload: any): Promise<any> {
        super.validate(payload);
    }

    authenticate(req) {
        super.authenticate(req);
    }
}
