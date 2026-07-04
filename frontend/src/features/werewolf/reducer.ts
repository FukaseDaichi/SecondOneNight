import type { SocketInfo } from '../../type';
import type { WerewolfUser } from '../../type/werewolf';
import type { WerewolfAction, WerewolfState } from './types';

export const initialWerewolfState: WerewolfState = {
    playerName: null,
    playerData: null,
    messageList: [],
    chatList: [],
    userList: [],
    turn: 0,
    winteamList: [],
    staticRollList: [],
    rollList: [],
    npcuser: null,
    limitTime: 0,
    rollInfoList: [],
    counterMap: {},
    startFlg: false,
    modalRoll: null,
    modalOwnFlg: false,
    rollSelectTurnFlg: false,
    votingStartFlg: false,
    cutInNo: 0,
    snipeSeq: 0,
    resultFlg: false,
    ruleFlg: false,
    winMessage: null,
};

// rollNoList(例 [1,1,2]) → counterMap(例 {1:2, 2:1})。旧 setRollCustum の置換
const toCounterMap = (rollNoList: number[] | null): Record<number, number> => {
    const map: Record<number, number> = {};
    if (!rollNoList) {
        return map;
    }
    rollNoList.forEach((no) => {
        map[no] = (map[no] || 0) + 1;
    });
    return map;
};

// 現行 dataSet(gamedata の6フィールド) + プレイヤーデータ設定 useEffect の写し。
// playerData は userList 内に自分が見つかった時のみ更新し、見つからなければ据え置く(keep-last)。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dataSet = (state: WerewolfState, obj: any): WerewolfState => {
    const next: WerewolfState = {
        ...state,
        userList: obj.userList,
        winteamList: obj.winteamList,
        turn: obj.turn,
        staticRollList: obj.staticRollList,
        rollList: obj.rollList,
        npcuser: obj.npcuser,
    };
    const own = obj.userList.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (element: any) => element.userName === state.playerName
    );
    if (own.length > 0) {
        next.playerData = own[0];
    }
    return next;
};

const onMessage = (state: WerewolfState, socketInfo: SocketInfo): WerewolfState => {
    switch (socketInfo.status) {
        case 100: // ルーム入室
        case 200: // ルーム入室(同一名ユーザ入室)
            return {
                ...dataSet(state, socketInfo.obj),
                limitTime: socketInfo.obj.limitTime,
                counterMap: toCounterMap(socketInfo.obj.rollNoList),
                rollInfoList: socketInfo.obj.rollList,
            };
        case 150: // 役職設定
            return {
                ...dataSet(state, socketInfo.obj),
                counterMap: toCounterMap(socketInfo.obj.rollNoList),
                rollInfoList: socketInfo.obj.rollList,
            };
        case 101: // チャット
            return { ...state, chatList: socketInfo.obj };
        case 300: // ゲーム開始
            return dataSet(
                { ...state, startFlg: true, ruleFlg: false, resultFlg: false },
                socketInfo.obj
            );
        case 400: // 役職選択
            return dataSet(state, socketInfo.obj);
        case 404: // 例外
            return { ...state, messageList: [...state.messageList, socketInfo.message] };
        case 500: {
            // 議論アクション
            let next = dataSet(state, socketInfo.obj);

            const userIndex = Number(socketInfo.message);
            const actionUser: WerewolfUser = socketInfo.obj.userList[userIndex];

            // 防御的ガード(現行は未定義indexで例外。挙動維持上ほぼ到達しないが安全側に倒す)
            if (!actionUser) {
                return next;
            }

            // 怪盗の場合
            if (actionUser.lastMessage === '怪盗した。') {
                if (actionUser.userName === state.playerName) {
                    next = { ...next, cutInNo: 11 };
                }
                return next;
            }

            switch (actionUser.roll?.rollNo) {
                case 6: // 独裁者
                    next = { ...next, cutInNo: 6, snipeSeq: state.snipeSeq + 1 };
                    break;
                case 8: // 占い師
                    if (actionUser.userName === state.playerName) {
                        next = { ...next, cutInNo: 8 };
                    }
                    break;
                case 9: // 付き人
                    if (actionUser.userName === state.playerName) {
                        next = { ...next, cutInNo: 9 };
                    }
                    break;
                case 10: // 暗殺者
                    next = { ...next, cutInNo: 10, snipeSeq: state.snipeSeq + 1 };
                    break;
                default:
                    break;
            }
            return next;
        }
        case 550: // 制限時間変更
            return { ...state, limitTime: socketInfo.obj };
        case 600: // ターン変更
            return dataSet(state, socketInfo.obj);
        case 650: // アイコン変更
            return { ...state, userList: socketInfo.obj };
        case 700: // 投票
            return {
                ...dataSet(state, socketInfo.obj),
                counterMap: toCounterMap(socketInfo.obj.rollNoList),
            };
        case 998: // エラーメッセージ表示(個人)
            if (socketInfo.userName === state.playerName) {
                return { ...state, messageList: [...state.messageList, socketInfo.message] };
            }
            return state;
        case 999: // エラーメッセージ表示(全員)
            return { ...state, messageList: [...state.messageList, socketInfo.message] };
        default:
            return state;
    }
};

export const werewolfReducer = (
    state: WerewolfState,
    action: WerewolfAction
): WerewolfState => {
    switch (action.type) {
        case 'message':
            return onMessage(state, action.payload);
        case 'roomIn':
            return { ...state, playerName: action.userName };
        case 'chatSent':
            return { ...state, messageList: [...state.messageList, action.message] };
        case 'systemMessage':
            return { ...state, messageList: [...state.messageList, action.text] };
        case 'dismissStart':
            return { ...state, startFlg: false };
        case 'counter': {
            const current = state.counterMap[action.rollNo] || 0;
            const value = Math.max(0, Math.min(15, current + action.delta));
            return {
                ...state,
                counterMap: { ...state.counterMap, [action.rollNo]: value },
            };
        }
        case 'setModalRoll':
            return { ...state, modalRoll: action.roll };
        case 'setModalOwnFlg':
            return { ...state, modalOwnFlg: action.value };
        case 'setRuleFlg':
            return { ...state, ruleFlg: action.value };
        case 'setResultFlg':
            return { ...state, resultFlg: action.value };
        case 'setRollSelectTurnFlg':
            return { ...state, rollSelectTurnFlg: action.value };
        case 'setVotingStartFlg':
            return { ...state, votingStartFlg: action.value };
        case 'clearCutIn':
            return { ...state, cutInNo: 0 };
        case 'setWinMessage':
            return { ...state, winMessage: action.message };
        default:
            return state;
    }
};
