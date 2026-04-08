/**
 * text-[Npx] + leading-{tight|snug|relaxed} → 정수 px line-height (1rem=16px 기준)
 * 실행: node scripts/normalize-text-line-height.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.join(__dirname, '..', 'src');

/** 긴/구체적 패턴을 먼저 적용 */
const REPLACEMENTS = [
  // non-contiguous (클래스 사이에 다른 유틸)
  [/text-\[11px\] font-medium leading-snug/g, 'text-[11px] font-medium leading-[16px]'],
  [/text-\[11px\] font-semibold leading-snug/g, 'text-[11px] font-semibold leading-[16px]'],
  [/text-\[10px\] font-medium leading-snug/g, 'text-[10px] font-medium leading-[14px]'],
  [/text-\[10px\] font-semibold leading-tight/g, 'text-[10px] font-semibold leading-[13px]'],
  [/text-\[10px\] font-medium leading-relaxed/g, 'text-[10px] font-medium leading-[16px]'],
  [/text-\[12px\] font-semibold leading-tight/g, 'text-[12px] font-semibold leading-[15px]'],
  [/text-\[12px\] font-medium leading-tight/g, 'text-[12px] font-medium leading-[15px]'],
  [/text-\[12px\] font-bold leading-tight/g, 'text-[12px] font-bold leading-[15px]'],
  [/text-\[12px\] font-medium leading-snug/g, 'text-[12px] font-medium leading-[17px]'],
  [/text-\[12px\] font-bold tracking-tight leading-snug/g, 'text-[12px] font-bold tracking-tight leading-[17px]'],
  [/relative min-w-0 flex-1 text-\[12px\] font-bold leading-tight/g, 'relative min-w-0 flex-1 text-[12px] font-bold leading-[15px]'],
  [/text-\[16px\] font-bold leading-snug/g, 'text-[16px] font-bold leading-[22px]'],
  [/text-\[16px\] font-bold leading-tight/g, 'text-[16px] font-bold leading-[20px]'],
  [/text-\[15px\] font-bold leading-tight/g, 'text-[15px] font-bold leading-[19px]'],
  [/text-\[11px\] font-semibold leading-tight/g, 'text-[11px] font-semibold leading-[14px]'],
  [/text-\[11px\] font-bold leading-tight/g, 'text-[11px] font-bold leading-[14px]'],
  [/text-\[12px\] font-semibold leading-tight truncate/g, 'text-[12px] font-semibold leading-[15px] truncate'],
  [/text-\[12px\] font-medium leading-tight truncate/g, 'text-[12px] font-medium leading-[15px] truncate'],
  [/text-\[13px\] leading-tight/g, 'text-[13px] leading-[16px]'],
  [/text-\[14px\] leading-tight/g, 'text-[14px] leading-[18px]'],
  [/text-\[14px\] leading-snug/g, 'text-[14px] leading-[19px]'],
  [/flex-1 min-w-0 text-\[10px\] font-medium truncate leading-tight/g, 'flex-1 min-w-0 text-[10px] font-medium truncate leading-[13px]'],
  [/flex-1 min-w-0 text-\[12px\] font-semibold leading-tight truncate/g, 'flex-1 min-w-0 text-[12px] font-semibold leading-[15px] truncate'],

  // relaxed / snug / tight (contiguous)
  [/text-\[10px\] leading-relaxed/g, 'text-[10px] leading-[16px]'],
  [/text-\[11px\] leading-relaxed/g, 'text-[11px] leading-[18px]'],
  [/text-\[12px\] leading-relaxed/g, 'text-[12px] leading-[20px]'],
  [/text-\[13px\] leading-relaxed/g, 'text-[13px] leading-[21px]'],
  [/text-\[10px\] leading-snug/g, 'text-[10px] leading-[14px]'],
  [/text-\[11px\] leading-snug/g, 'text-[11px] leading-[16px]'],
  [/text-\[12px\] leading-snug/g, 'text-[12px] leading-[17px]'],
  [/text-\[11px\] leading-tight/g, 'text-[11px] leading-[14px]'],
  [/text-\[10px\] leading-tight/g, 'text-[10px] leading-[13px]'],
  // 12px tight → 15px (남은 단순 케이스)
  [/text-\[12px\] leading-tight/g, 'text-[12px] leading-[15px]'],

  // px/py가 앞에 있는 변형
  [/text-\[12px\] px-1 py-2 leading-relaxed/g, 'text-[12px] leading-[20px] px-1 py-2'],
  [/text-\[11px\] px-1 py-1\.5 leading-relaxed/g, 'text-[11px] leading-[18px] px-1 py-1.5'],
  [/text-\[11px\] mt-1\.5 leading-snug/g, 'text-[11px] mt-1.5 leading-[16px]'],
  [/text-\[11px\] mt-0\.5 leading-snug/g, 'text-[11px] mt-0.5 leading-[16px]'],
  [/text-\[10px\] mt-0\.5 leading-snug/g, 'text-[10px] mt-0.5 leading-[14px]'],
  [/text-\[10px\] mt-1 leading-snug/g, 'text-[10px] mt-1 leading-[14px]'],
  [/text-\[10px\] mt-2\.5 leading-relaxed/g, 'text-[10px] mt-2.5 leading-[16px]'],
  [/block text-\[12px\] font-semibold truncate leading-tight/g, 'block text-[12px] font-semibold truncate leading-[15px]'],
  [/text-\[9px\] font-semibold px-1\.5 py-0\.5 rounded-\[4px\] leading-tight/g, 'text-[9px] font-semibold px-1.5 py-0.5 rounded-[4px] leading-[11px]'],
  [/text-\[8px\] leading-snug/g, 'text-[8px] leading-[11px]'],
  [/mt-2 px-2\.5 py-1\.5 rounded-full text-\[9px\] font-medium leading-snug/g, 'mt-2 px-2.5 py-1.5 rounded-full text-[9px] font-medium leading-[12px]'],
];

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(tsx|ts|css)$/.test(name)) out.push(p);
  }
  return out;
}

let total = 0;
for (const file of walk(srcRoot)) {
  let s = fs.readFileSync(file, 'utf8');
  const orig = s;
  for (const [re, rep] of REPLACEMENTS) {
    s = s.replace(re, rep);
  }
  if (s !== orig) {
    fs.writeFileSync(file, s);
    total++;
    console.log('updated', path.relative(path.join(__dirname, '..'), file));
  }
}
console.log('files touched:', total);
