import { WerewolfRoll } from '../../type/werewolf';

export type LobbyReadiness = { ready: boolean; messages: string[] };

const MIN_PLAYERS = 3;

// 開始条件: 3人以上 / 役職合計 > 参加人数 / 人狼陣営(teamNo=1)を含む
export const lobbyReadiness = (
    userCount: number,
    counterMap: Record<number, number>,
    staticRollList: WerewolfRoll[]
): LobbyReadiness => {
    const messages: string[] = [];
    const total = Object.values(counterMap).reduce((a, b) => a + b, 0);
    const wolfCount = staticRollList
        .filter((r) => r.teamNo === 1)
        .reduce((sum, r) => sum + (counterMap[r.rollNo] ?? 0), 0);

    if (userCount < MIN_PLAYERS) {
        messages.push(
            `開始には${MIN_PLAYERS}人必要です(あと${MIN_PLAYERS - userCount}人)`
        );
    }
    if (total <= userCount) {
        messages.push(`役職があと${userCount - total + 1}枚足りません`);
    }
    if (wolfCount === 0) {
        messages.push('人狼系の役職を1枚以上入れてください');
    }
    return { ready: messages.length === 0, messages };
};
