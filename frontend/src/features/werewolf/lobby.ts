import { WerewolfRoll } from '../../type/werewolf';

export type LobbyReadiness = {
    ready: boolean;
    messages: string[];
    dirty: boolean;
};

const MIN_PLAYERS = 3;

// ローカルの +/- は 0 枚になった役職も key として残す({5: 0})が、
// サーバ由来の counterMap は 0 の key を作らない。0 は「無し」として比較する
const nonZeroEntries = (counterMap: Record<number, number>) =>
    Object.entries(counterMap).filter(([, count]) => count > 0);

// 未反映(dirty): 手元の役職構成が、サーバが最後に受理した構成と食い違っている状態。
// 「設定」を押すまで送信されないため、この間の GAME START は表示と違う構成で始まってしまう
export const isRollRegulationDirty = (
    counterMap: Record<number, number>,
    appliedCounterMap: Record<number, number>
): boolean => {
    if (counterMap === appliedCounterMap) {
        return false;
    }
    const local = nonZeroEntries(counterMap);
    if (local.length !== nonZeroEntries(appliedCounterMap).length) {
        return true;
    }
    return local.some(
        ([rollNo, count]) => (appliedCounterMap[Number(rollNo)] ?? 0) !== count
    );
};

// 開始条件: 3人以上 / 役職合計 > 参加人数 / 人狼陣営(teamNo=1)を含む / 役職構成がサーバへ反映済み。
// dirty も同じ関数で返すことで、ページと MenuPanel の判定がズレないようにする
export const lobbyReadiness = (
    userCount: number,
    counterMap: Record<number, number>,
    appliedCounterMap: Record<number, number>,
    staticRollList: WerewolfRoll[]
): LobbyReadiness => {
    const messages: string[] = [];
    const total = Object.values(counterMap).reduce((a, b) => a + b, 0);
    const wolfCount = staticRollList
        .filter((r) => r.teamNo === 1)
        .reduce((sum, r) => sum + (counterMap[r.rollNo] ?? 0), 0);
    const dirty = isRollRegulationDirty(counterMap, appliedCounterMap);

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
    if (dirty) {
        messages.push('役職構成が未反映です。「設定」を押してください');
    }
    return { ready: messages.length === 0, messages, dirty };
};
