// 勝利演出のロジック(表示層のみ。reducer には触れない)

export type VictoryTeam = 'wolf' | 'village' | 'third';
export type VictoryPhase = 'celebration' | 'result' | 'closed';
export type VictoryEvent = 'timer' | 'skip' | 'return';

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

// 3段シーケンスの遷移: 演出(タップ/タイマーで結果へ)→ 結果 → ロビー復帰
export const nextVictoryPhase = (
    phase: VictoryPhase,
    event: VictoryEvent
): VictoryPhase => {
    if (phase === 'celebration' && (event === 'timer' || event === 'skip')) {
        return 'result';
    }
    if (phase === 'result' && event === 'return') {
        return 'closed';
    }
    return phase;
};
