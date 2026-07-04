import type { TimebombAction, TimebombState } from './types';

export const initialTimebombState: TimebombState = {
    playerName: '',
    messageList: [],
    timeBombUserList: [],
    leadCardsList: [],
    round: 0,
    turn: 0,
    releaseNo: 0,
    limitTime: 0,
    secretFlg: false,
    startFlg: false,
    roundMessageFlg: false,
    endFlg: false,
    bommerFlg: false,
    policeFlg: false,
};

// 現行 setData の写し。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setData = (state: TimebombState, room: any): TimebombState => {
    const next: TimebombState = {
        ...state,
        timeBombUserList: room.userList,
        turn: room.turn,
        releaseNo: room.releaseNo,
        endFlg: false,
        limitTime: room.limitTime,
        secretFlg: room.secretFlg,
    };
    if (room.leadCardsList) {
        next.leadCardsList = room.leadCardsList;
    }
    if (state.round != room.round && room.winnerTeam === 0) {
        next.round = room.round;
        if (room.round > 1) {
            next.roundMessageFlg = true;
        }
    }
    return next;
};

// 現行 receve の写し。status を持つ SocketInfo 形式と room オブジェクト直渡し形式の2系統を分岐する。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onMessage = (state: TimebombState, msg: any): TimebombState => {
    if (msg.status) {
        switch (msg.status) {
            case 200:
                return setData(
                    { ...state, messageList: [...state.messageList, msg.message] },
                    msg.obj
                );
            case 201: // アイコン変更時
                return { ...state, timeBombUserList: msg.obj };
            case 404:
                return { ...state, messageList: [...state.messageList, msg.message] };
            case 800:
                return { ...state, secretFlg: msg.obj };
            case 900: // 制限時間変更
                return { ...state, limitTime: msg.obj };
            default:
                return { ...state, messageList: [...state.messageList, msg.message] };
        }
    }

    let next = state;
    // 解除メッセージ判定
    if (state.releaseNo < msg.releaseNo) {
        next = { ...next, messageList: [...next.messageList, '解除に成功'] };
    }
    // データ設定
    next = setData(next, msg);
    // 開始判定
    if (msg.turn === 1) {
        next = { ...next, bommerFlg: false, policeFlg: false, startFlg: true };
    }
    // 勝敗判定
    if (msg.winnerTeam === 1) {
        return { ...next, policeFlg: true, endFlg: true };
    }
    if (msg.winnerTeam === 2) {
        return { ...next, bommerFlg: true, endFlg: true };
    }
    return next;
};

export const timebombReducer = (
    state: TimebombState,
    action: TimebombAction
): TimebombState => {
    switch (action.type) {
        case 'message':
            return onMessage(state, action.payload);
        case 'roomIn':
            return { ...state, playerName: action.userName };
        case 'systemMessage':
            return { ...state, messageList: [...state.messageList, action.text] };
        case 'dismissStart':
            return { ...state, startFlg: false };
        case 'dismissRoundMessage':
            return { ...state, roundMessageFlg: false };
        default:
            return state;
    }
};
