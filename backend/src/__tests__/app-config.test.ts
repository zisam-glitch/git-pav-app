import { readAppConfig } from "../lib/app-config";

describe("app config", () => {
  it("allows every version when nothing is set", () => {
    expect(readAppConfig({})).toEqual({ minimumAppVersion: "0.0.0", storeUrl: null });
  });

  it("returns the minimum version and store link", () => {
    expect(readAppConfig({ MIN_APP_VERSION: "1.2.0", APP_STORE_URL: "https://apps.apple.com/app/id1" })).toEqual({
      minimumAppVersion: "1.2.0",
      storeUrl: "https://apps.apple.com/app/id1",
    });
  });

  it("ignores a malformed version so nobody is locked out", () => {
    expect(readAppConfig({ MIN_APP_VERSION: "latest" }).minimumAppVersion).toBe("0.0.0");
  });

  it("only accepts an https store link", () => {
    expect(readAppConfig({ APP_STORE_URL: "javascript:alert(1)" }).storeUrl).toBeNull();
  });
});
