import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs } from '../lib/cli.mjs';

test('parseArgs reads flags with values and booleans', () => {
    const a = parseArgs(['--voice', 'Achernar', '--scenes', 'hook,pick', '--force'], { values: ['voice', 'scenes'], booleans: ['force', 'audition'] });
    assert.deepEqual(a, { voice: 'Achernar', scenes: 'hook,pick', force: true, audition: false });
});

test('parseArgs rejects a value flag whose value is missing or another flag', () => {
    assert.throws(() => parseArgs(['--voice', '--force'], { values: ['voice'], booleans: ['force'] }), /--voice/);
    assert.throws(() => parseArgs(['--video'], { values: ['video'], booleans: [] }), /--video/);
});

test('parseArgs rejects unknown flags', () => {
    assert.throws(() => parseArgs(['--vocie', 'x'], { values: ['voice'], booleans: [] }), /--vocie/);
});
