#!/usr/bin/env node
// Build out/timeline.json from script.json + out/durations.json.
//   node timeline.mjs [--write-subtitles]
// --write-subtitles estimates subtitles[].at for scenes whose at are all 0, or whose narration changed since the last estimate.
import { readFile, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadScript, validateScript, estimateSubtitleTimes, narrationHash } from './lib/script.mjs';
import { computeTimeline, checkTotal } from './lib/timeline.mjs';
import { parseArgs } from './lib/cli.mjs';

const root = dirname(fileURLToPath(import.meta.url));
function fail(msg) { console.error(`[timeline] ${msg}`); process.exit(1); }
let opts;
try { opts = parseArgs(process.argv.slice(2), { values: [], booleans: ['write-subtitles'] }); } catch (err) { fail(err.message); }

const scriptPath = join(root, 'script.json');
const script = await loadScript(scriptPath);
const errors = validateScript(script);
if (errors.length) fail(`script.json が不正です:\n  ${errors.join('\n  ')}`);

const outDir = join(root, 'out');
const durFile = join(outDir, 'durations.json');
try { await access(durFile); } catch { fail(`${durFile} がありません。先に node tts.mjs を実行してください`); }
const durations = JSON.parse(await readFile(durFile, 'utf8'));
const subHashFile = join(outDir, 'subtitles-hash.json');
let subHashes = {};
try { subHashes = JSON.parse(await readFile(subHashFile, 'utf8')); } catch { /* first run */ }

if (opts['write-subtitles']) {
    let changed = false;
    for (const scene of script.scenes) {
        if (typeof durations[scene.id] !== 'number') continue;
        const hash = narrationHash(scene, script.voice, script.style);
        const allZero = scene.subtitles.every((s) => s.at === 0);
        if (!allZero && subHashes[scene.id] === hash) continue;
        scene.subtitles = estimateSubtitleTimes(scene.narration, durations[scene.id]);
        subHashes[scene.id] = hash;
        changed = true;
        console.log(`[timeline] ${scene.id}: 字幕の秒を推定しました`);
    }
    if (changed) {
        await writeFile(scriptPath, JSON.stringify(script, null, 2) + '\n');
        await writeFile(subHashFile, JSON.stringify(subHashes, null, 2) + '\n');
    }
}

const timeline = computeTimeline(script, durations);
await writeFile(join(outDir, 'timeline.json'), JSON.stringify(timeline, null, 2) + '\n');

console.log('id        start    dur   narr');
for (const s of timeline.scenes) {
    console.log(`${s.id.padEnd(8)} ${s.start.toFixed(2).padStart(6)} ${s.dur.toFixed(2).padStart(6)} ${s.narrationDur.toFixed(2).padStart(6)}`);
}
console.log(`total    ${timeline.total.toFixed(2)} s → out/timeline.json`);

const warning = checkTotal(timeline.total);
if (warning) fail(warning);
