export const DEFAULT_EDITOR_URL = "http://127.0.0.1:5175/?fix=fill-auto-open#";

export function controlSocketUrl(editorUrl = DEFAULT_EDITOR_URL) {
  try {
    const url = new URL(editorUrl);
    if (
      url.protocol !== "http:" ||
      (url.hostname !== "127.0.0.1" && url.hostname !== "localhost")
    ) {
      return null;
    }
    url.protocol = "ws:";
    url.pathname = "/__airship/ws";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}
