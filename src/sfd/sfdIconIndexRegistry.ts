/**
 * `sfd-icon-2026/*.svg` 파일명 끝의 `_숫자`를 인덱스로 해 URL을 조회합니다.
 * 새 파일을 폴더에 넣기만 하면 glob에 포함됩니다.
 */
const modules = import.meta.glob('../../sfd-icon-2026/icon_*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, unknown>;

function normalizeAssetUrl(mod: unknown): string {
  if (typeof mod === 'string') return mod;
  if (mod && typeof mod === 'object' && 'default' in mod && typeof (mod as { default: unknown }).default === 'string') {
    return (mod as { default: string }).default;
  }
  return '';
}

const INDEX_TO_URL: Record<number, string> = {};
const seenDup = new Set<number>();

for (const [path, mod] of Object.entries(modules)) {
  const url = normalizeAssetUrl(mod);
  if (!url) continue;
  const m = path.match(/_(\d+)\.svg$/);
  if (!m) continue;
  const idx = Number(m[1]);
  if (INDEX_TO_URL[idx] !== undefined && INDEX_TO_URL[idx] !== url) seenDup.add(idx);
  INDEX_TO_URL[idx] = url;
}

if (import.meta.env.DEV && seenDup.size > 0) {
  console.warn('[sfd-icon] 동일 인덱스를 가진 서로 다른 파일이 있습니다:', [...seenDup]);
}

/** 알려진 모든 아이콘 인덱스 (정렬) */
export const SFD_KNOWN_ICON_INDICES = Object.keys(INDEX_TO_URL)
  .map(Number)
  .sort((a, b) => a - b);

export function getSfdIconUrlByIndex(index: number): string | undefined {
  return INDEX_TO_URL[index];
}

/** 내부 맵 — 디버그·도구용 */
export const SFD_ICON_INDEX_TO_URL: Readonly<Record<number, string>> = INDEX_TO_URL;
