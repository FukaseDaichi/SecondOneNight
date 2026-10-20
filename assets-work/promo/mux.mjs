#!/usr/bin/env node
// Mix narration WAVs into the Motion export.
//   node mux.mjs [--video out/motion-export.mp4] [--out out/werewolf-promo-9x16.mp4]
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMuxArgs, checkNarrationFits } from './lib/mux-filter.mjs';
import { parseArgs } from './lib/cli.mjs';

const root = dirname(fileURLToPath(import.meta.url));
function fail(msg) {
    console.error(`[mux] ${msg}`);
    process.exit(1);
}
let opts;
try { opts = parseArgs(process.argv.slice(2), { values: ['video', 'out'], booleans: [] }); } catch (err) { fail(err.message); }
const video = opts.video ? join(process.cwd(), opts.video) : join(root, 'out', 'motion-export.mp4');
const out = opts.out ? join(process.cwd(), opts.out) : join(root, 'out', 'werewolf-promo-9x16.mp4');
const narrationDir = join(root, 'out');

function probe(file, extra = []) {
    const r = spawnSync('ffprobe', ['-v', 'error', ...extra, '-of', 'csv=p=0', file], { encoding: 'utf8' });
    if (r.status !== 0) fail(`ffprobe failed for ${file}: ${r.stderr}`);
    return r.stdout.trim();
}

const videoDuration = Number(probe(video, ['-show_entries', 'format=duration']));
if (!Number.isFinite(videoDuration) || videoDuration <= 0) fail(`映像長を取得できません: ${video}`);
const videoHasAudio = probe(video, ['-select_streams', 'a', '-show_entries', 'stream=codec_type']) !== '';

const timeline = JSON.parse(await readFile(join(root, 'out', 'timeline.json'), 'utf8'));
const overflow = checkNarrationFits(timeline.scenes, videoDuration);
if (overflow) fail(overflow);

const ffArgs = buildMuxArgs({ video, scenes: timeline.scenes, narrationDir, out, videoHasAudio });
console.log(`[mux] video ${videoDuration.toFixed(2)} s, audio stream: ${videoHasAudio ? 'yes' : 'no'}`);
const r = spawnSync('ffmpeg', ffArgs, { stdio: 'inherit' });
if (r.status !== 0) fail(`ffmpeg exited with ${r.status}`);

const outVideo = Number(probe(out, ['-select_streams', 'v', '-show_entries', 'stream=duration']));
const outAudio = Number(probe(out, ['-select_streams', 'a', '-show_entries', 'stream=duration']));
console.log(`[mux] → ${out}  video ${outVideo.toFixed(2)} s / audio ${outAudio.toFixed(2)} s`);
if (Math.abs(outVideo - outAudio) > 0.5) console.warn(`[mux] 警告: 映像長と音声長の差が ${(outVideo - outAudio).toFixed(2)} 秒あります`);
