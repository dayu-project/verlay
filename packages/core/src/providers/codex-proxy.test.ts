import { describe, expect, it, vi } from "vitest";
import { codexEnvironment, macSystemProxy } from "./codex-proxy";

describe("codexEnvironment", () => {
  it("bridges the enabled macOS HTTPS proxy into the Codex child", () => {
    const readProxy = vi.fn(() => "http://127.0.0.1:7897");

    expect(codexEnvironment({ PATH: "/bin" }, "darwin", readProxy)).toEqual({
      HTTP_PROXY: "http://127.0.0.1:7897",
      HTTPS_PROXY: "http://127.0.0.1:7897",
      http_proxy: "http://127.0.0.1:7897",
      https_proxy: "http://127.0.0.1:7897",
      PATH: "/bin",
    });
    expect(readProxy).toHaveBeenCalledOnce();
  });

  it("preserves an explicit proxy without reading system settings", () => {
    const readProxy = vi.fn(() => "http://system-proxy:7897");

    expect(
      codexEnvironment(
        { HTTPS_PROXY: "http://explicit-proxy:8080", PATH: "/bin" },
        "darwin",
        readProxy
      )
    ).toEqual({
      HTTPS_PROXY: "http://explicit-proxy:8080",
      PATH: "/bin",
    });
    expect(readProxy).not.toHaveBeenCalled();
  });

  it("does not inspect macOS settings on another platform", () => {
    const readProxy = vi.fn(() => "http://127.0.0.1:7897");

    expect(codexEnvironment({ PATH: "/bin" }, "linux", readProxy)).toEqual({
      PATH: "/bin",
    });
    expect(readProxy).not.toHaveBeenCalled();
  });
});

describe("macSystemProxy", () => {
  it("parses an enabled HTTPS proxy", () => {
    expect(
      macSystemProxy(`
<dictionary> {
  HTTPSEnable : 1
  HTTPSPort : 7897
  HTTPSProxy : 127.0.0.1
}
`)
    ).toBe("http://127.0.0.1:7897");
  });

  it("rejects disabled or malformed proxy settings", () => {
    expect(
      macSystemProxy(`
<dictionary> {
  HTTPSEnable : 0
  HTTPSPort : 7897
  HTTPSProxy : 127.0.0.1
}
`)
    ).toBeUndefined();
    expect(
      macSystemProxy(`
<dictionary> {
  HTTPSEnable : 1
  HTTPSPort : nope
  HTTPSProxy : 127.0.0.1
}
`)
    ).toBeUndefined();
  });
});
