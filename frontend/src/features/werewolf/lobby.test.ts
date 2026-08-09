import { describe, expect, it } from 'vitest';
import { isRollRegulationDirty, lobbyReadiness } from './lobby';
import { WerewolfRoll } from '../../type/werewolf';

const roll = (rollNo: number, teamNo: number) =>
    ({ rollNo, teamNo }) as unknown as WerewolfRoll;
// rollNo 1 = 人狼(teamNo 1)、rollNo 2 = 村人(teamNo 2)
const rolls = [roll(1, 1), roll(2, 2)];

const DIRTY_MESSAGE = '役職構成が未反映です。「設定」を押してください';

describe('isRollRegulationDirty', () => {
    it('同じ構成なら未反映ではない', () => {
        expect(isRollRegulationDirty({ 1: 1, 2: 3 }, { 1: 1, 2: 3 })).toBe(
            false
        );
    });
    it('同一参照なら未反映ではない', () => {
        const map = { 1: 1, 2: 3 };
        expect(isRollRegulationDirty(map, map)).toBe(false);
    });
    it('枚数が違えば未反映', () => {
        expect(isRollRegulationDirty({ 1: 1, 2: 4 }, { 1: 1, 2: 3 })).toBe(
            true
        );
    });
    it('役職が増えていれば未反映', () => {
        expect(
            isRollRegulationDirty({ 1: 1, 2: 3, 5: 1 }, { 1: 1, 2: 3 })
        ).toBe(true);
    });
    it('役職が減っていれば未反映', () => {
        expect(isRollRegulationDirty({ 1: 1 }, { 1: 1, 2: 3 })).toBe(true);
    });
    // +1 して -1 すると counterMap に {5: 0} が残るが、サーバ由来の map は 0 の key を作らない
    it('0枚の key が残っていても、実構成が同じなら未反映ではない', () => {
        expect(
            isRollRegulationDirty({ 1: 1, 2: 3, 5: 0 }, { 1: 1, 2: 3 })
        ).toBe(false);
    });
    it('0枚の key しかない構成と空の構成は同じ扱い', () => {
        expect(isRollRegulationDirty({ 5: 0 }, {})).toBe(false);
    });
    it('0枚の key を挟んでも実構成が違えば未反映', () => {
        expect(
            isRollRegulationDirty({ 1: 1, 2: 3, 5: 0 }, { 1: 1, 2: 2 })
        ).toBe(true);
    });
});

describe('lobbyReadiness', () => {
    it('条件を全て満たすと ready', () => {
        const r = lobbyReadiness(3, { 1: 1, 2: 3 }, { 1: 1, 2: 3 }, rolls);
        expect(r.ready).toBe(true);
        expect(r.dirty).toBe(false);
        expect(r.messages).toEqual([]);
    });
    it('3人未満は人数メッセージ', () => {
        const r = lobbyReadiness(2, { 1: 1, 2: 2 }, { 1: 1, 2: 2 }, rolls);
        expect(r.ready).toBe(false);
        expect(r.messages).toContain('開始には3人必要です(あと1人)');
    });
    it('役職が参加人数以下なら不足数を出す', () => {
        const r = lobbyReadiness(3, { 1: 1, 2: 2 }, { 1: 1, 2: 2 }, rolls);
        expect(r.ready).toBe(false);
        expect(r.messages).toContain('役職があと1枚足りません');
    });
    it('人狼系ゼロなら専用メッセージ', () => {
        const r = lobbyReadiness(3, { 2: 4 }, { 2: 4 }, rolls);
        expect(r.ready).toBe(false);
        expect(r.messages).toContain('人狼系の役職を1枚以上入れてください');
    });
    it('他の条件を満たしていても未反映なら ready にならない', () => {
        const r = lobbyReadiness(3, { 1: 1, 2: 3 }, { 1: 1, 2: 2 }, rolls);
        expect(r.dirty).toBe(true);
        expect(r.ready).toBe(false);
        expect(r.messages).toEqual([DIRTY_MESSAGE]);
    });
    it('0枚の key が残っているだけなら未反映扱いにしない', () => {
        const r = lobbyReadiness(
            3,
            { 1: 1, 2: 3, 5: 0 },
            { 1: 1, 2: 3 },
            rolls
        );
        expect(r.dirty).toBe(false);
        expect(r.ready).toBe(true);
    });
});
