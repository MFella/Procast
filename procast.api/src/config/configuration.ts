const PORT: number = 3000;

interface SupabaseConfigKeys {
  SUPABASE_PASSWORD: string;
  SUPABASE_URL: string;
  SUPABASE_JWT_SECRET: string;
}

type GoogleOauthPayloadScope = "profile" | "email";

export type GoogleOauthPayload = {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  scopes: Array<GoogleOauthPayloadScope>;
};

export type SupabaseConfig = {
  [K in keyof SupabaseConfigKeys]: string;
};

const supabaseSetupConfig: SupabaseConfig = {
  SUPABASE_PASSWORD: "BsbmuwAP38xX@4M",
  SUPABASE_URL: "https://funrtmkcnvmllwggwkpr.supabase.co",
  SUPABASE_JWT_SECRET:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1bnJ0bWtjbnZtbGx3Z2d3a3ByIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3MDk2MzU1MSwiZXhwIjoxOTg2NTM5NTUxfQ.ki3fhwT1kRjn3CwGunqS0qp_oArfMAz7b17RROFvEnI",
};
const googleOauthPayload: GoogleOauthPayload = {
  clientId: "187695350870-ar0g3ng5fvum5k58vt5tc2s72h3lu4lf.apps.googleusercontent.com",
  clientSecret: "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",
  callbackUrl: "http://localhost:4200/home",
  scopes: ["profile", "email"],
};

export const base64Secret: string = "awjC1Ymi/nShWdj2xfD5Mg==";
export const jwtExpirationTime: string = "3600";

export default () => ({
  port: PORT,
  supabaseConfig: supabaseSetupConfig,
  jwtSecret: base64Secret,
  jwtExpirationTime,
  googleOauthPayload,
});
