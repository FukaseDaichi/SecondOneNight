import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadEnv } from '../lib/env.mjs';

test('loadEnv parses KEY=value, ignores comments/blank, strips quotes', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'promo-env-'));
    const file = join(dir, '.env');
    await writeFile(file, '# c\n\nGEMINI_API_KEY="abc"\nX = y \n');
    const env = await loadEnv(file);
    assert.deepEqual(env, { GEMINI_API_KEY: 'abc', X: 'y' });
});

test('loadEnv returns {} when file is missing', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'promo-env-'));
    assert.deepEqual(await loadEnv(join(dir, 'missing.env')), {});
});
