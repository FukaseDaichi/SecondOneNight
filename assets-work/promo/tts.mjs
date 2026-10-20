#!/usr/bin/env node
// Generate one narration WAV per scene with Gemini 3.8 Flash TTS.
//   node tts.mjs [--voice Name] [--scenes hook,pick] [--force] [--audition]
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './lib/env.mjs';
import { loadScript, validateScript } from './lib/script.mjs';
import { buildTtsRequest, extractAudioBase64, TTS_ENDPOINT } from './lib/tts-request.mjs';
import { wavDurationSeconds } from './lib/wav.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (name) => {
    const i = args.indexOf(name);
    return i === -1 ? null : args[i + 1] ?? '';
};
const has = (name) => args.includes(name);

function fail(msg) {
    console.error(`[tts] ${msg}`);
    process.exit(1);
}

const env = await loadEnv(join(root, '.env'));
const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) fail('assets-work/promo/.env に GEMINI_API_KEY を設定してください');

const script = await loadScript(join(root, 'script.json'));
const errors = validateScript(script);
if (errors.length) fail(`script.json が不正です:\n  ${errors.join('\n  ')}`);

const voice = flag('--voice') || script.voice;
if (!voice) fail('--voice <name> を指定するか、script.json の voice を設定してください');

const audition = has('--audition');
const force = has('--force');
const only = flag('--scenes');
const wanted = only ? new Set(only.split(',').map((s) => s.trim()).filter(Boolean)) : null;
if (wanted) {
    const known = new Set(script.scenes.map((s) => s.id));
    for (const id of wanted) if (!known.has(id)) fail(`未知のシーン id: ${id}`);
}

const outDir = audition ? join(root, 'out', 'audition') : join(root, 'out');
await mkdir(outDir, { recursive: true });

async function exists(p) {
    try {
        await access(p);
        return true;
    } catch {
        return false;
    }
}

async function synthesize(text) {
    const res = await fetch(TTS_ENDPOINT, {
        method: 'POST',
        headers: { 'x-goog-api-key': apiKey, 'content-type': 'application/json' },
        body: JSON.stringify(buildTtsRequest({ text, voice, style: script.style })),
    });
    const bodyText = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${bodyText.slice(0, 300)}`);
    let json;
    try {
        json = JSON.parse(bodyText);
    } catch {
        throw new Error(`non-JSON response: ${bodyText.slice(0, 200)}`);
    }
    return Buffer.from(extractAudioBase64(json), 'base64');
}

const durations = {};
for (const scene of script.scenes) {
    if (wanted && !wanted.has(scene.id)) continue;
    const file = audition ? join(outDir, `${voice}-${scene.id}.wav`) : join(outDir, `narration-${scene.id}.wav`);
    if (!force && (await exists(file))) {
        console.log(`[tts] skip (exists): ${file}`);
    } else {
        process.stdout.write(`[tts] ${scene.id} (${voice}) ... `);
        let wav;
        try {
            wav = await synthesize(scene.narration);
        } catch (err) {
            console.log('');
            fail(`${scene.id}: ${err.message}`);
        }
        if (!wav || wav.length < 44) fail(`${scene.id}: 音声が空です`);
        await writeFile(file, wav);
        console.log(`${(wav.length / 1024).toFixed(0)} KiB`);
    }
    if (!audition) durations[scene.id] = wavDurationSeconds(await readFile(file));
}

if (!audition) {
    // Keep durations for scenes we did not regenerate this run.
    const durFile = join(outDir, 'durations.json');
    let previous = {};
    if (await exists(durFile)) previous = JSON.parse(await readFile(durFile, 'utf8'));
    const merged = { ...previous, ...durations };
    await writeFile(durFile, JSON.stringify(merged, null, 2) + '\n');
    console.log(`[tts] durations → ${durFile}`);
    for (const [id, sec] of Object.entries(merged)) console.log(`  ${id.padEnd(8)} ${sec.toFixed(3)} s`);
}
