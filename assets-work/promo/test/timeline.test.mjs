import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeTimeline, checkTotal } from '../lib/timeline.mjs';

const script = {
    scenes: [
        { id: 'hook', name: 'フック', narrationOffset: 1.6, tailPad: 0.4, subtitles: [{ text: 'a', at: 0 }] },
        { id: 'title', name: 'タイトル', narrationOffset: 0.4, tailPad: 0.4, subtitles: [{ text: 'b', at: 0 }] },
    ],
};

test('computeTimeline chains scenes and applies offsets', () => {
    const t = computeTimeline(script, { hook: 2.0, title: 5.0 });
    assert.equal(t.total, 9.8);
    assert.deepEqual(
        t.scenes.map(({ id, start, dur, narrationStart, narrationDur }) => ({ id, start, dur, narrationStart, narrationDur })),
        [
            { id: 'hook', start: 0, dur: 4.0, narrationStart: 1.6, narrationDur: 2.0 },
            { id: 'title', start: 4.0, dur: 5.8, narrationStart: 4.4, narrationDur: 5.0 },
        ]
    );
    assert.equal(t.scenes[1].name, 'タイトル');
    assert.deepEqual(t.scenes[1].subtitles, [{ text: 'b', at: 0 }]);
});

test('computeTimeline throws when a scene has no duration', () => {
    assert.throws(() => computeTimeline(script, { hook: 2.0 }), /title/);
});

test('checkTotal flags totals over 85 seconds', () => {
    assert.equal(checkTotal(84.9), null);
    assert.match(checkTotal(85.1), /85 秒超/);
    assert.match(checkTotal(85.1), /85\.1/);
});
