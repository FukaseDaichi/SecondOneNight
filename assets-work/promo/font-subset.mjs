#!/usr/bin/env node
// Rebuild the Japanese font subsets (woff2) the Motion film uses as assets.
// Strings come from script.json (narration / emphasis / subtitles / scene names) + font-extra-strings.txt (UI strings).
//   node font-subset.mjs            → out/fonts/{ShipporiMincho-600,ZenKakuGothicNew-700,ZenKakuGothicNew-500}.woff2
// Needs python3 (a venv with fonttools+brotli is created under out/fonts/venv) and network for the Google Fonts TTFs (first run).
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadScript, collectFontStrings } from './lib/script.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const outDir = join(root, 'out', 'fonts');
const venv = join(outDir, 'venv');
const dl = join(outDir, 'dl');
const FONTS = [
    ['shipporimincho/ShipporiMincho-SemiBold.ttf', 'ShipporiMincho-600'],
    ['zenkakugothicnew/ZenKakuGothicNew-Bold.ttf', 'ZenKakuGothicNew-700'],
    ['zenkakugothicnew/ZenKakuGothicNew-Medium.ttf', 'ZenKakuGothicNew-500'],
];
const RANGES = 'U+0020-007E,U+00A0-00FF,U+2010-2027,U+203B,U+3000-303F,U+3041-309F,U+30A0-30FF,U+FF01-FF5E,U+FF61-FF9F';

function fail(msg) { console.error(`[fonts] ${msg}`); process.exit(1); }
function run(cmd, args) { const r = spawnSync(cmd, args, { stdio: 'inherit' }); if (r.status !== 0) fail(`${cmd} ${args.join(' ')} failed (${r.status})`); }
async function exists(p) { try { await access(p); return true; } catch { return false; } }

await mkdir(dl, { recursive: true });
const script = await loadScript(join(root, 'script.json'));
const extra = await readFile(join(root, 'font-extra-strings.txt'), 'utf8');
const strings = collectFontStrings(script, extra);
const stringsFile = join(outDir, 'font-strings.txt');
await writeFile(stringsFile, strings + '\n');
console.log(`[fonts] ${new Set(strings).size} unique chars → ${stringsFile}`);

if (!(await exists(join(venv, 'bin', 'pyftsubset')))) {
    console.log('[fonts] creating venv with fonttools + brotli ...');
    run('python3', ['-m', 'venv', venv]);
    run(join(venv, 'bin', 'pip'), ['install', '-q', 'fonttools', 'brotli']);
}
for (const [path, stem] of FONTS) {
    const ttf = join(dl, path.split('/').pop());
    if (!(await exists(ttf))) {
        const url = `https://github.com/google/fonts/raw/main/ofl/${path}`;
        console.log(`[fonts] downloading ${url}`);
        const res = await fetch(url);
        if (!res.ok) fail(`download failed: HTTP ${res.status} ${url}`);
        await writeFile(ttf, Buffer.from(await res.arrayBuffer()));
    }
    run(join(venv, 'bin', 'pyftsubset'), [ttf, `--text-file=${stringsFile}`, `--unicodes=${RANGES}`, '--flavor=woff2', '--layout-features=*', '--no-hinting', `--output-file=${join(outDir, stem + '.woff2')}`]);
    console.log(`[fonts] → ${join(outDir, stem + '.woff2')}`);
}
console.log('[fonts] 完了。Motion の assets/<stem>.woff2 をアップロードし直し、assets ドキュメントの ref を更新してください');
