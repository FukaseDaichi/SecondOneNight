import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMuxArgs, checkNarrationFits } from '../lib/mux-filter.mjs';

test('buildMuxArgs lists inputs in scene order and delays by narrationStart', () => {
    const args = buildMuxArgs({
        video: 'v.mp4',
        scenes: [
            { id: 'hook', narrationStart: 1.6 },
            { id: 'title', narrationStart: 5.2 },
        ],
        narrationDir: 'out',
        out: 'o.mp4',
    });
    assert.deepEqual(args.slice(0, 6), ['-y', '-i', 'v.mp4', '-i', 'out/narration-hook.wav', '-i']);
    assert.equal(args[6], 'out/narration-title.wav');
    const fc = args[args.indexOf('-filter_complex') + 1];
    assert.match(fc, /\[1:a\]adelay=1600\|1600/);
    assert.match(fc, /\[2:a\]adelay=5200\|5200/);
    assert.match(fc, /amix=inputs=2:normalize=0/);
    assert.match(fc, /loudnorm=I=-16:TP=-1\.5:LRA=11/);
    assert.match(fc, /\[0:a\]volume=0\.4/);
    assert.match(fc, /amix=inputs=2:duration=first:normalize=0\[aout\]/);
    assert.ok(args.includes('-c:v') && args[args.indexOf('-c:v') + 1] === 'copy');
    assert.deepEqual(args.slice(args.indexOf('-map'), args.indexOf('-map') + 4), ['-map', '0:v', '-map', '[aout]']);
    assert.ok(args.includes('-movflags') && args[args.indexOf('-movflags') + 1] === '+faststart');
    assert.equal(args.at(-1), 'o.mp4');
});

test('buildMuxArgs without a video audio stream outputs narration only', () => {
    const args = buildMuxArgs({
        video: 'v.mp4',
        scenes: [{ id: 'hook', narrationStart: 1.6 }],
        narrationDir: 'out',
        out: 'o.mp4',
        videoHasAudio: false,
    });
    const fc = args[args.indexOf('-filter_complex') + 1];
    assert.doesNotMatch(fc, /\[0:a\]/);
    assert.match(fc, /loudnorm=I=-16:TP=-1\.5:LRA=11\[aout\]/);
});

test('checkNarrationFits reports overflow with the scene id', () => {
    const scenes = [{ id: 'cta', narrationStart: 70, narrationDur: 9 }];
    assert.equal(checkNarrationFits(scenes, 80), null);
    assert.match(checkNarrationFits(scenes, 78), /1\.0 秒長い.*cta/);
});
