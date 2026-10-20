#!/usr/bin/env node
// Generate one narration WAV per scene with Gemini 3.8 Flash TTS.
//   node tts.mjs [--voice Name] [--scenes hook,pick] [--force] [--audition]
// A scene is regenerated when its WAV is missing, --force is given, or its narration/voice/style changed since the last run.
// Env overrides (tests): TTS_ENDPOINT, PROMO_OUT_DIR.
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './lib/env.mjs';
import { loadScript, validateScript, narrationHash } from './lib/script.mjs';
import { buildTtsRequest, extractAudioBase64, TTS_ENDPOINT } from './lib/tts-request.mjs';
import { wavDurationSeconds } from './lib/wav.mjs';
import { parseArgs } from './lib/cli.mjs';

const root = dirname(fileURLToPath(import.meta.url));
function fail(msg) { console.error(`[tts] ${msg}`); process.exit(1); }

let opts;
try { opts = parseArgs(process.argv.slice(2), { values: ['voice', 'scenes'], booleans: ['force', 'audition'] }); }
catch (err) { fail(err.message); }

const env = await loadEnv(join(root, '.env'));
const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) fail('assets-work/promo/.env に GEMINI_API_KEY を設定してください');
const endpoint = process.env.TTS_ENDPOINT || TTS_ENDPOINT;

const script = await loadScript(join(root, 'script.json'));
const errors = validateScript(script);
if (errors.length) fail(`script.json が不正です:\n  ${errors.join('\n  ')}`);

const voice = opts.voice || script.voice;
if (!voice) fail('--voice <name> を指定するか、script.json の voice を設定してください');

const wanted = opts.scenes ? new Set(opts.scenes.split(',').map((s) => s.trim()).filter(Boolean)) : null;
if (wanted) {
    const known = new Set(script.scenes.map((s) => s.id));
    for (const id of wanted) if (!known.has(id)) fail(`未知のシーン id: ${id}`);
}

const baseOut = process.env.PROMO_OUT_DIR || join(root, 'out');
const outDir = opts.audition ? join(baseOut, 'audition') : baseOut;
await mkdir(outDir, { recursive: true });

async function exists(p) { try { await access(p); return true; } catch { return false; } }
async function readJsonIfExists(p) { return (await exists(p)) ? JSON.parse(await readFile(p, 'utf8')) : {}; }

async function synthesize(text) {
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'x-goog-api-key': apiKey, 'content-type': 'application/json' },
        body: JSON.stringify(buildTtsRequest({ text, voice, style: script.style })),
    });
    const bodyText = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${bodyText.slice(0, 300)}`);
    let json;
    try { json = JSON.parse(bodyText); } catch { throw new Error(`non-JSON response: ${bodyText.slice(0, 200)}`); }
    const wav = Buffer.from(extractAudioBase64(json), 'base64');
    const seconds = wavDurationSeconds(wav); // throws on anything that is not a RIFF/WAVE with fmt+data
    if (seconds <= 0) throw new Error('音声の長さが 0 秒です');
    return { wav, seconds };
}

const hashFile = join(outDir, 'narration-hash.json');
const durFile = join(outDir, 'durations.json');
const prevHash = opts.audition ? {} : await readJsonIfExists(hashFile);
const durations = opts.audition ? {} : await readJsonIfExists(durFile);
const hashes = { ...prevHash };

for (const scene of script.scenes) {
    if (wanted && !wanted.has(scene.id)) continue;
    const file = opts.audition ? join(outDir, `${voice}-${scene.id}.wav`) : join(outDir, `narration-${scene.id}.wav`);
    const hash = narrationHash(scene, voice, script.style);
    const have = await exists(file);
    const changed = !opts.audition && have && prevHash[scene.id] !== hash;
    if (have && !opts.force && !changed) {
        console.log(`[tts] skip (exists, unchanged): ${file}`);
    } else {
        process.stdout.write(`[tts] ${scene.id} (${voice})${changed ? ' [台本が変わったため再生成]' : ''} ... `);
        let result;
        try { result = await synthesize(scene.narration); }
        catch (err) { console.log(''); fail(`${scene.id}: ${err.message}`); }
        await writeFile(file, result.wav);
        console.log(`${(result.wav.length / 1024).toFixed(0)} KiB, ${result.seconds.toFixed(3)} s`);
    }
    if (!opts.audition) {
        durations[scene.id] = wavDurationSeconds(await readFile(file));
        hashes[scene.id] = hash;
    }
}

if (!opts.audition) {
    await writeFile(durFile, JSON.stringify(durations, null, 2) + '\n');
    await writeFile(hashFile, JSON.stringify(hashes, null, 2) + '\n');
    console.log(`[tts] durations → ${durFile}`);
    for (const [id, sec] of Object.entries(durations)) console.log(`  ${id.padEnd(8)} ${sec.toFixed(3)} s`);
}
