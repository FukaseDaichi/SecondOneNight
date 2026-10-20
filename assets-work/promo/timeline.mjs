#!/usr/bin/env node
// Build out/timeline.json from script.json + out/durations.json.
//   node timeline.mjs [--write-subtitles]
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadScript, validateScript, estimateSubtitleTimes } from './lib/script.mjs';
import { computeTimeline, checkTotal } from './lib/timeline.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const writeSubtitles = process.argv.includes('--write-subtitles');

const scriptPath = join(root, 'script.json');
const script = await loadScript(scriptPath);
const errors = validateScript(script);
if (errors.length) {
    console.error(`[timeline] script.json が不正です:\n  ${errors.join('\n  ')}`);
    process.exit(1);
}
const durations = JSON.parse(await readFile(join(root, 'out', 'durations.json'), 'utf8'));

if (writeSubtitles) {
    let changed = false;
    for (const scene of script.scenes) {
        const allZero = scene.subtitles.every((s) => s.at === 0);
        if (!allZero || typeof durations[scene.id] !== 'number') continue;
        scene.subtitles = estimateSubtitleTimes(scene.narration, durations[scene.id]);
        changed = true;
    }
    if (changed) {
        await writeFile(scriptPath, JSON.stringify(script, null, 2) + '\n');
        console.log('[timeline] script.json の subtitles[].at を実測から推定して書き込みました');
    }
}

const timeline = computeTimeline(script, durations);
await writeFile(join(root, 'out', 'timeline.json'), JSON.stringify(timeline, null, 2) + '\n');

console.log('id        start    dur   narr');
for (const s of timeline.scenes) {
    console.log(`${s.id.padEnd(8)} ${s.start.toFixed(2).padStart(6)} ${s.dur.toFixed(2).padStart(6)} ${s.narrationDur.toFixed(2).padStart(6)}`);
}
console.log(`total    ${timeline.total.toFixed(2)} s → out/timeline.json`);

const warning = checkTotal(timeline.total);
if (warning) {
    console.error(`[timeline] ${warning}`);
    process.exit(1);
}
