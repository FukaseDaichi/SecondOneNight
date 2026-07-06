import { describe, expect, it } from 'vitest';
import {
    isDeadUser,
    nextVictoryAct,
    revealOrder,
    victoryPalette,
    victoryTeam,
} from './victory';
import { particleCount } from '../../components/common/sakuraParticlesOptions';
import { WerewolfUser } from '../../type/werewolf';

const user = (userNo: number, teamNo: number, punishmentFlg = false) =>
    ({
        userNo,
        userName: `u${userNo}`,
        roll: { teamNo, punishmentFlg },
    }) as unknown as WerewolfUser;

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

describe('isDeadUser', () => {
    it('punishmentFlg が true なら死亡', () => {
        expect(isDeadUser(user(1, 2, true))).toBe(true);
    });
    it('punishmentFlg が false なら生存', () => {
        expect(isDeadUser(user(1, 2, false))).toBe(false);
    });
    it('roll が null でも落ちない', () => {
        expect(
            isDeadUser({ userNo: 1, roll: null } as unknown as WerewolfUser)
        ).toBe(false);
    });
});

describe('revealOrder', () => {
    it('人狼陣営(teamNo=1)を最後に回し、他は userNo 昇順', () => {
        const order = revealOrder([user(3, 1), user(1, 2), user(2, 3)]).map(
            (u) => u.userNo
        );
        expect(order).toEqual([1, 2, 3]);
    });
    it('人狼が複数でも全員最後尾に並ぶ', () => {
        const order = revealOrder([user(1, 1), user(2, 2), user(3, 1)]).map(
            (u) => u.userNo
        );
        expect(order).toEqual([2, 1, 3]);
    });
});

describe('nextVictoryAct', () => {
    it('reveal → advance → verdict', () => {
        expect(nextVictoryAct('reveal', 'advance')).toBe('verdict');
    });
    it('verdict → advance → result', () => {
        expect(nextVictoryAct('verdict', 'advance')).toBe('result');
    });
    it('reveal → skip → verdict(種明かし飛ばし。盤面+勝敗発表は残す)', () => {
        expect(nextVictoryAct('reveal', 'skip')).toBe('verdict');
    });
    it('verdict → skip → result', () => {
        expect(nextVictoryAct('verdict', 'skip')).toBe('result');
    });
    it('result → return → closed', () => {
        expect(nextVictoryAct('result', 'return')).toBe('closed');
    });
    it('無関係なイベントでは遷移しない', () => {
        expect(nextVictoryAct('result', 'advance')).toBe('result');
    });
});
