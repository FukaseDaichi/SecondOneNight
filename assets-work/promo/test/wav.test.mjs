import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wavDurationSeconds } from '../lib/wav.mjs';

function chunk(id, body) {
    const head = Buffer.alloc(8);
    head.write(id, 0, 'ascii');
    head.writeUInt32LE(body.length, 4);
    return Buffer.concat([head, body, body.length % 2 ? Buffer.alloc(1) : Buffer.alloc(0)]);
}

function fmt({ rate = 24000, channels = 1, bits = 16 } = {}) {
    const b = Buffer.alloc(16);
    b.writeUInt16LE(1, 0); // PCM
    b.writeUInt16LE(channels, 2);
    b.writeUInt32LE(rate, 4);
    b.writeUInt32LE((rate * channels * bits) / 8, 8); // byteRate
    b.writeUInt16LE((channels * bits) / 8, 12);
    b.writeUInt16LE(bits, 14);
    return chunk('fmt ', b);
}

function wav(chunks) {
    const body = Buffer.concat([Buffer.from('WAVE', 'ascii'), ...chunks]);
    const riff = Buffer.alloc(8);
    riff.write('RIFF', 0, 'ascii');
    riff.writeUInt32LE(body.length, 4);
    return Buffer.concat([riff, body]);
}

test('wavDurationSeconds reads a plain 24kHz mono 16-bit WAV', () => {
    const buf = wav([fmt(), chunk('data', Buffer.alloc(48000))]);
    assert.equal(wavDurationSeconds(buf), 1.0);
});

test('wavDurationSeconds skips a LIST chunk before data', () => {
    const list = chunk('LIST', Buffer.alloc(26));
    const buf = wav([fmt(), list, chunk('data', Buffer.alloc(72000))]);
    assert.equal(wavDurationSeconds(buf), 1.5);
});

test('wavDurationSeconds throws when data chunk is missing', () => {
    assert.throws(() => wavDurationSeconds(wav([fmt()])), /data/);
});
