import getStarted from "#/content/get-started.json";
import { oneOf } from "#/content/resolve";

const DOWNLOAD_KINDS = ["chrome", "vscode"] as const;

export type DownloadKind = (typeof DOWNLOAD_KINDS)[number];

export interface GetStartedDownload {
  action: string;
  fileName: string;
  href: string;
  id: string;
  kind: DownloadKind;
  meta: string;
  title: string;
}

export interface GetStartedGuide {
  id: string;
  steps: readonly string[];
  title: string;
}

export const GET_STARTED_DOWNLOADS: readonly GetStartedDownload[] =
  getStarted.downloads.map((download) => ({
    ...download,
    kind: oneOf(DOWNLOAD_KINDS, download.kind, "download kind"),
  }));

export const GET_STARTED_GUIDES: readonly GetStartedGuide[] = getStarted.guides;

export const GET_STARTED_SECTION = {
  desc: getStarted.desc,
  guideDesc: getStarted.guideDesc,
  heading: getStarted.heading,
};
