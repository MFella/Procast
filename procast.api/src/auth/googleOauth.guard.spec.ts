import { GoogleOauthGuard } from "./googleOauth.guard";

describe("GoogleOauthGuard", () => {
  it("should be defined", () => {
    expect(new GoogleOauthGuard()).toBeDefined();
  });
});
