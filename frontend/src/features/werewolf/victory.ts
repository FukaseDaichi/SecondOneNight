import { WerewolfUser } from '../../type/werewolf';

// 勝利演出のロジック(表示層のみ。reducer には触れない)

export type VictoryTeam = 'wolf' | 'village' | 'third';

// 死亡者(処刑=最多得票 / 暗殺者・独裁者の銃撃)は backend が roll.punishmentFlg を立てる
export const isDeadUser = (user: WerewolfUser): boolean =>
    !!user.roll?.punishmentFlg;

// 種明かしの開示順: 人狼陣営(teamNo=1)を最後に回してタメを作る。他は userNo 昇順
export const revealOrder = (userList: WerewolfUser[]): WerewolfUser[] => {
    const wolves = userList
        .filter((u) => u.roll?.teamNo === 1)
        .sort((a, b) => a.userNo - b.userNo);
    const others = userList
        .filter((u) => u.roll?.teamNo !== 1)
        .sort((a, b) => a.userNo - b.userNo);
    return [...others, ...wolves];
};

// 3幕構成: 種明かし → 勝敗発表 → 結果 → ロビー復帰
// 種明かしの盤面は verdict / result 中も残す(一枚絵)。skip は勝敗発表まで飛ぶ
export type VictoryAct = 'reveal' | 'verdict' | 'result' | 'closed';
export type VictoryActEvent = 'advance' | 'skip' | 'return';

export const nextVictoryAct = (
    act: VictoryAct,
    event: VictoryActEvent
): VictoryAct => {
    if ((event === 'advance' || event === 'skip') && act === 'reveal') {
        return 'verdict';
    }
    if ((event === 'advance' || event === 'skip') && act === 'verdict') {
        return 'result';
    }
    if (event === 'return' && act === 'result') {
        return 'closed';
    }
    return act;
};

// teamNo: 1=人狼陣営 / 2=村人陣営 / 3=第三陣営(てるてる)
export const victoryTeam = (winteamList: number[]): VictoryTeam => {
    if (winteamList[0] === 1) {
        return 'wolf';
    }
    if (winteamList[0] === 2) {
        return 'village';
    }
    return 'third';
};

// 陣営別の花びら palette(tokens.scss の色系統に合わせる)
export const victoryPalette = (winteamList: number[]): string[] => {
    switch (victoryTeam(winteamList)) {
        case 'wolf':
            return ['#E88F94', '#C4646E', '#E9A7BE', '#F3B9BC'];
        case 'village':
            return ['#35A8B4', '#7FD0D6', '#8FD0D6', '#CBEDF0'];
        case 'third':
            return ['#D3A94F', '#ECD9A8', '#E3BE6E', '#B98A2F'];
    }
};
