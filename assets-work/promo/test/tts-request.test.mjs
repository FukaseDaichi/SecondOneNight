import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTtsRequest, extractAudioBase64 } from '../lib/tts-request.mjs';

test('buildTtsRequest shapes the Interactions body', () => {
    const b = buildTtsRequest({ text: '議論中に、人が死ぬ。', voice: 'Despina', style: 'S' });
    assert.equal(b.model, 'gemini-3.8-flash-tts');
    assert.equal(b.input[0].type, 'user_input');
    assert.equal(b.input[0].content[0].type, 'text');
    assert.equal(b.input[0].content[0].text, '議論中に、人が死ぬ。');
    assert.deepEqual(b.input[0].content[0].annotations, [{ type: 'speech_metadata', style: 'S' }]);
    assert.deepEqual(b.generation_config.speech_config, [{ voice: 'Despina' }]);
    assert.deepEqual(b.response_format, { type: 'audio' });
});

test('extractAudioBase64 picks the last model_output audio step', () => {
    const r = {
        steps: [
            { type: 'model_output', content: [{ type: 'audio', data: 'T0xE' }] },
            { type: 'model_output', content: [{ type: 'text', text: 'x' }, { type: 'audio', data: 'QUJD' }] },
        ],
    };
    assert.equal(extractAudioBase64(r), 'QUJD');
});

test('extractAudioBase64 throws with body excerpt when no audio', () => {
    assert.throws(
        () => extractAudioBase64({ error: { message: 'blocked' } }),
        /no audio in response: .*blocked/
    );
});
