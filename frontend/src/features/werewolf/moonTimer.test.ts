import { describe, expect, it } from 'vitest';
import {
    formatTime,
    formatTimeSpoken,
    lerpColor,
    phaseProgress,
    warmth,
    TIMER_ROSE,
    TIMER_TEAL,
} from './moonTimer';

describe('formatTime', () => {
    it('分と秒を m:ss で返す(秒はゼロ埋め)', () => {
        expect(formatTime(185)).toBe('3:05');
        expect(formatTime(60)).toBe('1:00');
        expect(formatTime(9)).toBe('0:09');
    });
    it('小数は切り上げる(表示上の残り秒)', () => {
        expect(formatTime(4.2)).toBe('0:05');
    });
    it('0 以下は 0:00', () => {
        expect(formatTime(0)).toBe('0:00');
        expect(formatTime(-3)).toBe('0:00');
    });
});

describe('formatTimeSpoken', () => {
    it('分がある時は N分M秒', () => {
        expect(formatTimeSpoken(185)).toBe('3分5秒');
        expect(formatTimeSpoken(60)).toBe('1分0秒');
    });
    it('1分未満は M秒 のみ', () => {
        expect(formatTimeSpoken(9)).toBe('9秒');
    });
    it('小数は切り上げ、0 以下は 0秒', () => {
        expect(formatTimeSpoken(4.2)).toBe('5秒');
        expect(formatTimeSpoken(0)).toBe('0秒');
        expect(formatTimeSpoken(-3)).toBe('0秒');
    });
});

describe('phaseProgress', () => {
    it('満月(total)で 1、ゼロで 0 を返す', () => {
        expect(phaseProgress(300, 300)).toBe(1);
        expect(phaseProgress(0, 300)).toBe(0);
    });
    it('中間は rem/total', () => {
        expect(phaseProgress(150, 300)).toBeCloseTo(0.5);
    });
    it('範囲外はクランプ、total<=0 は 0', () => {
        expect(phaseProgress(400, 300)).toBe(1);
        expect(phaseProgress(-10, 300)).toBe(0);
        expect(phaseProgress(50, 0)).toBe(0);
    });
});

describe('warmth', () => {
    it('残り60秒で 0、10秒で 1', () => {
        expect(warmth(60)).toBe(0);
        expect(warmth(10)).toBe(1);
    });
    it('60秒超は 0、10秒未満は 1 にクランプ', () => {
        expect(warmth(120)).toBe(0);
        expect(warmth(5)).toBe(1);
    });
    it('中間(35秒)は 0.5', () => {
        expect(warmth(35)).toBeCloseTo(0.5);
    });
});

describe('lerpColor', () => {
    it('t=0 は from、t=1 は to', () => {
        expect(lerpColor('#000000', '#ffffff', 0)).toBe('rgb(0, 0, 0)');
        expect(lerpColor('#000000', '#ffffff', 1)).toBe('rgb(255, 255, 255)');
    });
    it('t=0.5 は中間値', () => {
        expect(lerpColor('#000000', '#ffffff', 0.5)).toBe('rgb(128, 128, 128)');
    });
    it('teal→rose を補間できる', () => {
        expect(lerpColor(TIMER_TEAL, TIMER_ROSE, 0)).toBe('rgb(127, 208, 214)');
        expect(lerpColor(TIMER_TEAL, TIMER_ROSE, 1)).toBe('rgb(240, 148, 155)');
    });
});
