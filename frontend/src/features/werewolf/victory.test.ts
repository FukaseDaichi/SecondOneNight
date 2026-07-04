import { describe, expect, it } from 'vitest';
import {
    nextVictoryPhase,
    victoryPalette,
    victoryTeam,
} from './victory';
import { particleCount } from '../../components/common/sakuraParticlesOptions';

describe('victoryTeam', () => {
    it('teamNo 1 は人狼陣営', () => {
        expect(victoryTeam([1])).toBe('wolf');
    });
    it('teamNo 2 は村人陣営', () => {
        expect(victoryTeam([2])).toBe('village');
    });
    it('teamNo 3 は第三陣営', () => {
        expect(victoryTeam([3])).toBe('third');
    });
    it('未知の teamNo は第三陣営扱い', () => {
        expect(victoryTeam([99])).toBe('third');
    });
});

describe('victoryPalette', () => {
    it('人狼陣営はローズ系', () => {
        expect(victoryPalette([1])).toContain('#E88F94');
    });
    it('村人陣営はティール系', () => {
        expect(victoryPalette([2])).toContain('#35A8B4');
    });
    it('第三陣営は金系', () => {
        expect(victoryPalette([3])).toContain('#D3A94F');
    });
});

describe('nextVictoryPhase', () => {
    it('演出フェーズはタイマーで結果フェーズへ', () => {
        expect(nextVictoryPhase('celebration', 'timer')).toBe('result');
    });
    it('演出フェーズはタップスキップで結果フェーズへ', () => {
        expect(nextVictoryPhase('celebration', 'skip')).toBe('result');
    });
    it('結果フェーズは「ロビーへ戻る」で閉じる', () => {
        expect(nextVictoryPhase('result', 'return')).toBe('closed');
    });
    it('結果フェーズでタイマーが発火しても遷移しない', () => {
        expect(nextVictoryPhase('result', 'timer')).toBe('result');
    });
    it('閉じた後はどのイベントでも閉じたまま', () => {
        expect(nextVictoryPhase('closed', 'timer')).toBe('closed');
        expect(nextVictoryPhase('closed', 'skip')).toBe('closed');
        expect(nextVictoryPhase('closed', 'return')).toBe('closed');
    });
});

describe('particleCount', () => {
    it('ambient は PC 15 / スマホ 10', () => {
        expect(particleCount('ambient', false)).toBe(15);
        expect(particleCount('ambient', true)).toBe(10);
    });
    it('celebration は PC 60 / スマホ 35', () => {
        expect(particleCount('celebration', false)).toBe(60);
        expect(particleCount('celebration', true)).toBe(35);
    });
});
