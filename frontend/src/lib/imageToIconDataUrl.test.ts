import { describe, expect, it } from 'vitest';
import { assertIconDataUrlSize, MAX_DATA_URL_LENGTH } from './imageToIconDataUrl';

describe('assertIconDataUrlSize', () => {
    it('上限以下ならそのまま返す', () => {
        const url = 'data:image/jpeg;base64,' + 'a'.repeat(100);
        expect(assertIconDataUrlSize(url)).toBe(url);
    });

    it('上限超過で日本語エラーを投げる', () => {
        const url = 'data:image/jpeg;base64,' + 'a'.repeat(MAX_DATA_URL_LENGTH);
        expect(() => assertIconDataUrlSize(url)).toThrow(
            '画像を小さくできませんでした'
        );
    });
});
