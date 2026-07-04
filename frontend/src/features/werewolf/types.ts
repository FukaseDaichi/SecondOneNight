import type { SocketInfo } from '../../type';
import type { WerewolfRoll, WerewolfUser } from '../../type/werewolf';

export type WerewolfState = {
    playerName: string | null;
    playerData: WerewolfUser | null; // keep-last(見つかった時のみ更新)
    messageList: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatList: any[];
    // gamedata(現行 dataSet の6フィールド)
    userList: WerewolfUser[];
    turn: number;
    winteamList: number[];
    staticRollList: WerewolfRoll[];
    rollList: WerewolfRoll[];
    npcuser: WerewolfUser | null;
    roomCode: string | null;
    // gamedata(dataSet 外で受信)
    limitTime: number;
    rollInfoList: WerewolfRoll[];
    // 役職カスタマイズ(旧 #cunter_N DOM。rollNo → 人数)
    counterMap: Record<number, number>;
    // view
    startFlg: boolean;
    modalRoll: WerewolfRoll | null;
    modalOwnFlg: boolean;
    rollSelectTurnFlg: boolean;
    votingStartFlg: boolean;
    cutInNo: number;
    snipeSeq: number; // 銃声再生トリガ(独裁者/暗殺者アクションごとに +1)
    resultFlg: boolean;
    ruleFlg: boolean;
    winMessage: string | null;
};

export type WerewolfAction =
    | { type: 'message'; payload: SocketInfo }
    | { type: 'roomIn'; userName: string }
    | { type: 'chatSent'; message: string }
    | { type: 'systemMessage'; text: string }
    | { type: 'dismissStart' }
    | { type: 'counter'; rollNo: number; delta: 1 | -1 } // 0〜15 でクランプ
    | { type: 'setModalRoll'; roll: WerewolfRoll | null }
    | { type: 'setModalOwnFlg'; value: boolean }
    | { type: 'setRuleFlg'; value: boolean }
    | { type: 'setResultFlg'; value: boolean }
    | { type: 'setRollSelectTurnFlg'; value: boolean }
    | { type: 'setVotingStartFlg'; value: boolean }
    | { type: 'clearCutIn' }
    | { type: 'setWinMessage'; message: string | null };
