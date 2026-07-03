import type { SocketInfo } from '../../type';
import type { DecryptAction, DecryptState } from './types';

export const initialDecryptState: DecryptState = {
    playerName: null,
    playerData: null,
    messageList: [],
    chatList: [],
    userList: [],
    gameTime: 0,
    turn: 0,
    choiceMode: 0,
    winnerTeam: 0,
    leftTeam: null,
    rightTeam: null,
    startFlg: false,
};

// 現行 dataSet + プレイヤーデータ設定 useEffect の写し。
// playerData は userList 内に自分が見つかった時のみ更新し、見つからなければ据え置く(現行 keep-last と同じ)。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dataSet = (state: DecryptState, obj: any): DecryptState => {
    const next: DecryptState = {
        ...state,
        userList: obj.userList,
        turn: obj.turn,
        gameTime: obj.gameTime,
        choiceMode: obj.choiceMode,
        winnerTeam: obj.winnerTeam,
        leftTeam: obj.leftTeam,
        rightTeam: obj.rightTeam,
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

const onMessage = (state: DecryptState, socketInfo: SocketInfo): DecryptState => {
    switch (socketInfo.status) {
        case 100: // ルーム入室
        case 110: // 暗号リセット
        case 120: // チームリセット
        case 130: // チーム選択
        case 140: // モードチェンジ
        case 350: // 立候補
        case 370: // 暗号作成
        case 500: // 解読
            return dataSet(state, socketInfo.obj);
        case 101: // チャット
            return { ...state, chatList: socketInfo.obj };
        case 200: // 同一ユーザ入室
            return {
                ...dataSet(state, socketInfo.obj),
                messageList: [...state.messageList, socketInfo.message],
            };
        case 300: // ゲーム開始
            return dataSet({ ...state, startFlg: true }, socketInfo.obj);
        case 404: // 例外
            return { ...state, messageList: [...state.messageList, socketInfo.message] };
        case 650: // アイコン変更
            return { ...state, userList: socketInfo.obj };
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

export const decryptReducer = (
    state: DecryptState,
    action: DecryptAction
): DecryptState => {
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
        default:
            return state;
    }
};
