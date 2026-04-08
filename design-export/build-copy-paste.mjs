import fs from "fs";

const hdr = `================================================================================
html.to.design Editor — 한 파일에서 구간만 나눠 복사
  · '=== HTML' 블록 → 플러그인 HTML 칸 / '=== CSS' 블록 → CSS 칸
  · 구분 줄(===), <<<HTML 끝>>> 줄은 붙여넣지 않음
================================================================================

`;

let html = fs.readFileSync(
  new URL("./workspace-shell-for-html-to-design.fragment.html", import.meta.url),
  "utf8",
);
html = html.replace(/^<!--[\s\S]*?-->\n?/, "");

const css = fs.readFileSync(
  new URL("./workspace-shell-for-html-to-design.css", import.meta.url),
  "utf8",
);

const out =
  hdr +
  "=== HTML (아래 div부터 <<<HTML 끝>>> 직전까지) ===\n\n" +
  html.trim() +
  "\n\n<<<HTML 끝>>>\n\n" +
  "=== CSS (아래 줄부터 끝까지) ===\n\n" +
  css;

fs.writeFileSync(
  new URL("./html-to-design-COPY-PASTE.txt", import.meta.url),
  out,
  "utf8",
);
console.log("ok");
