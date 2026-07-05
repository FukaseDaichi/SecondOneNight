import { describe, expect, it } from 'vitest';
import { lobbyReadiness } from './lobby';
import { WerewolfRoll } from '../../type/werewolf';

const roll = (rollNo: number, teamNo: number) =>
    ({ rollNo, teamNo }) as unknown as WerewolfRoll;
// rollNo 1 = 人狼(teamNo 1)、rollNo 2 = 村人(teamNo 2)
const rolls = [roll(1, 1), roll(2, 2)];

describe('lobbyReadiness', () => {
    it('条件を全て満たすと ready', () => {
        const r = lobbyReadiness(3, { 1: 1, 2: 3 }, rolls);
        expect(r.ready).toBe(true);
        expect(r.messages).toEqual([]);
    });
    it('3人未満は人数メッセージ', () => {
        const r = lobbyReadiness(2, { 1: 1, 2: 2 }, rolls);
        expect(r.ready).toBe(false);
        expect(r.messages).toContain('開始には3人必要です(あと1人)');
    });
    it('役職が参加人数以下なら不足数を出す', () => {
        const r = lobbyReadiness(3, { 1: 1, 2: 2 }, rolls);
        expect(r.ready).toBe(false);
        expect(r.messages).toContain('役職があと1枚足りません');
    });
    it('人狼系ゼロなら専用メッセージ', () => {
        const r = lobbyReadiness(3, { 2: 4 }, rolls);
        expect(r.ready).toBe(false);
        expect(r.messages).toContain('人狼系の役職を1枚以上入れてください');
    });
});
