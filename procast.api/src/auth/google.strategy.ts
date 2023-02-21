import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth2";
import { GoogleOauthPayload } from "src/config/configuration";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(private readonly configService: ConfigService) {
    const googleOauthPayload: GoogleOauthPayload = configService.get("googleOauthPayload");
    super({
      clientID: googleOauthPayload.clientId,
      clientSecret: googleOauthPayload.clientSecret,
      callbackUrl: googleOauthPayload.callbackUrl,
      scope: googleOauthPayload.scopes,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<unknown> {
    try {
      const jwtToken = "placeholderJwt";
      const { name, emails, photos } = profile;

      const user = {
        email: emails.at(0)?.value,
        jwtToken,
      };

      return done(null, user);
    } catch (error: unknown) {
      return done(error, false);
    }
  }
}
