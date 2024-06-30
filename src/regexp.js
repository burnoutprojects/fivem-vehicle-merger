export const EXCLUDE_FOLDERS = new RegExp(/^\[.*\]$|.git/);
export const EXCLUDE_FILES = new RegExp(/README.md$|fxmanifest.lua$/);
export const EXCLUDE_FILTER = new RegExp(
  EXCLUDE_FOLDERS.source + "|" + EXCLUDE_FILES.source
);
