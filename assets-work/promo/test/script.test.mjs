import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadScript, validateScript, estimateSubtitleTimes } from '../lib/script.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = join(here, '..', 'script.json');
const ORDER = ['hook', 'title', 'pick', 'secret', 'public', 'vote', 'cta'];

function minimalScript(overrides = {}) {
    return {
        voice: null,
        style: 'S',
        scenes: ORDER.map((id) => ({
            id,
            name: id,
            narration: 'テスト。',
            emphasis: 'テスト',
            narrationOffset: 0.4,
            tailPad: 0.4,
            subtitles: [{ text: 'テスト。', at: 0 }],
        })),
        ...overrides,
    };
}

test('validateScript accepts the real script.json', async () => {
    const script = await loadScript(SCRIPT_PATH);
    assert.deepEqual(validateScript(script), []);
});

test('validateScript rejects bad ids', () => {
    const s = minimalScript();
    s.scenes[0].id = 'Hook 1';
    s.scenes[1].id = 'a/b';
    const errors = validateScript(s);
    assert.ok(errors.some((e) => e.includes('Hook 1')));
    assert.ok(errors.some((e) => e.includes('a/b')));
});

test('validateScript rejects duplicate ids and empty narration', () => {
    const s = minimalScript();
    s.scenes[1].id = 'hook';
    s.scenes[2].narration = '';
    const errors = validateScript(s);
    assert.ok(errors.some((e) => /hook/.test(e) && /重複|duplicate/i.test(e)));
    assert.ok(errors.some((e) => /pick/.test(e) && /narration/.test(e)));
});

test('validateScript requires 7 scenes in spec order', () => {
    const s = minimalScript();
    s.scenes.reverse();
    assert.ok(validateScript(s).some((e) => /順|order/i.test(e)));
    const short = minimalScript();
    short.scenes.pop();
    assert.ok(validateScript(short).some((e) => /7/.test(e)));
});

test('estimateSubtitleTimes splits on 。 and apportions by length', () => {
    const r = estimateSubtitleTimes('最後は、一斉投票。最多票が処刑され、役職が一枚ずつ、明かされる。', 10);
    assert.equal(r.length, 2);
    assert.equal(r[0].at, 0);
    assert.equal(r[0].text, '最後は、一斉投票。');
    assert.ok(r[1].at > 2 && r[1].at < 4, `at=${r[1].at}`);
});
