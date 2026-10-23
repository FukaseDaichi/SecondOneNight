import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const TTS = join(here, '..', 'tts.mjs');

async function withServer(handler, fn) {
    const server = createServer(handler);
    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    try { return await fn(`http://127.0.0.1:${server.address().port}`); }
    finally { server.close(); }
}

function run(endpoint, outDir) {
    // async spawn: a sync spawn would block the event loop and starve the fake server in this process
    return new Promise((resolve) => {
        const child = spawn(process.execPath, [TTS, '--voice', 'TestVoice', '--scenes', 'hook', '--force'], {
            env: { ...process.env, GEMINI_API_KEY: 'test-key', TTS_ENDPOINT: endpoint, PROMO_OUT_DIR: outDir },
        });
        let stdout = '', stderr = '';
        child.stdout.on('data', (d) => { stdout += d; });
        child.stderr.on('data', (d) => { stderr += d; });
        child.on('close', (status) => resolve({ status, stdout, stderr }));
    });
}

test('tts.mjs writes no file and exits non-zero when the audio payload is not a WAV', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'promo-tts-'));
    const r = await withServer((req, res) => {
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ steps: [{ type: 'model_output', content: [{ type: 'audio', data: Buffer.alloc(100, 7).toString('base64') }] }] }));
    }, (endpoint) => run(endpoint, outDir));
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stderr, /RIFF|WAV/);
    assert.deepEqual(await readdir(outDir), []);
});

test('tts.mjs writes no file and exits non-zero on an HTTP error', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'promo-tts-'));
    const r = await withServer((req, res) => { res.statusCode = 400; res.end('{"error":{"message":"bad request"}}'); }, (endpoint) => run(endpoint, outDir));
    assert.equal(r.status, 1);
    assert.match(r.stderr, /HTTP 400/);
    assert.deepEqual(await readdir(outDir), []);
});
