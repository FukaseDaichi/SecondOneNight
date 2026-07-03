import type { SocketInfo } from '../../type';
import type { HideoutAction, HideoutState } from './types';

export const initialHideoutState: HideoutState = {
    playerName: null,
    messageList: [],
    chatList: [],
    userList: [],
    memberFirldList: [],
    rushFlg: false,
    firldBuilding: null,
    waitUserIndexList: [],
    memberCardList: [],
    buildingCardList: [],
    winnerTeam: 0,
    turn: 0,
    viewMemberCardList: [],
    startFlg: false,
    rushAreaFlg: false,
    swatWinFlg: false,
    terroristWinFlg: false,
};

// 現行 dataSet + 各 useEffect(ラッシュ監視・勝敗監視・ヘッダ用情報更新)の写し。
// useEffect の「変化時のみ発火」は前回値との比較ガードで再現する。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dataSet = (state: HideoutState, obj: any): HideoutState => {
    const next: HideoutState = {
        ...state,
        userList: obj.userList,
        rushFlg: obj.rushFlg,
        firldBuilding: obj.firldBuilding,
        memberFirldList: obj.memberFirldList,
        waitUserIndexList: obj.waitUserIndexList,
        winnerTeam: obj.winnerTeam,
        memberCardList: obj.memberCardList,
        buildingCardList: obj.buildingCardList,
        turn: obj.turn,
    };
    if (obj.rushFlg && !state.rushFlg) {
        next.rushAreaFlg = true;
    }
    if (obj.winnerTeam !== state.winnerTeam && obj.winnerTeam === 1) {
        next.swatWinFlg = true;
    }
    if (obj.winnerTeam !== state.winnerTeam && obj.winnerTeam === 2) {
        next.terroristWinFlg = true;
    }
    if (obj.turn !== state.turn || obj.rushFlg !== state.rushFlg) {
        next.viewMemberCardList = obj.memberCardList;
    }
    return next;
};

const onMessage = (state: HideoutState, socketInfo: SocketInfo): HideoutState => {
    switch (socketInfo.status) {
        case 100: // ルーム入室
        case 200: // ルーム入室(同一名ユーザ入室)
        case 500: // 突入
            return dataSet(state, socketInfo.obj);
        case 101: // チャット
            return { ...state, chatList: socketInfo.obj };
        case 300: // ゲーム開始
            return dataSet(
                {
                    ...state,
                    rushAreaFlg: false,
                    terroristWinFlg: false,
                    swatWinFlg: false,
                    startFlg: true,
                },
                socketInfo.obj
            );
        case 400: // ゲーム待機(誰かの行動でラッシュタイム終了)
            return dataSet({ ...state, rushAreaFlg: false }, socketInfo.obj);
        case 600: // アイコン変更
            return { ...state, userList: socketInfo.obj };
        default:
            return state;
    }
};

export const hideoutReducer = (
    state: HideoutState,
    action: HideoutAction
): HideoutState => {
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
        case 'closeRushArea':
            return { ...state, rushAreaFlg: false };
        case 'dismissSwatWin':
            return { ...state, swatWinFlg: false };
        case 'dismissTerroristWin':
            return { ...state, terroristWinFlg: false };
        default:
            return state;
    }
};
