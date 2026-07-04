import type { SocketInfo } from '../../type';
import type { FakeartistAction, FakeartistState } from './types';

export const initialFakeartistState: FakeartistState = {
    playerName: null,
    playerData: null,
    messageList: [],
    chatList: [],
    userList: [],
    turn: 0,
    gameTime: 0,
    theme: '',
    endMessage: '',
    patternList: [],
    limitTime: 0,
    artDataStrokeList: [],
    remoteStroke: null,
    remoteStrokeSeq: 0,
    redrawSeq: 0,
    clearSeq: 0,
    resultSeq: 0,
    startFlg: false,
    disscuttionStartFlg: false,
    votingStartFlg: false,
    personCanvasZindex: -1,
    endFlg: false,
};

// 現行 dataSet(gamedata の7フィールド) + プレイヤーデータ設定 useEffect + ゲーム監視 effect の写し。
// playerData は userList 内に自分が見つかった時のみ更新し、見つからなければ据え置く(keep-last)。
// gameTime の変化ガードで disscuttionStartFlg / votingStartFlg を立てる。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dataSet = (state: FakeartistState, obj: any): FakeartistState => {
    const next: FakeartistState = {
        ...state,
        userList: obj.userList,
        turn: obj.turn,
        gameTime: obj.gameTime,
        theme: obj.theme,
        endMessage: obj.endMessage,
        patternList: obj.patternList,
        limitTime: obj.limitTime,
    };

    if (obj.gameTime === 2 && state.gameTime !== 2) {
        next.disscuttionStartFlg = true;
    } else if (obj.gameTime === 3 && state.gameTime !== 3) {
        next.votingStartFlg = true;
    }

    const own = obj.userList.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (element: any) => element.userName === state.playerName
    );
    if (own.length > 0) {
        next.playerData = own[0];
    }
    return next;
};

const onMessage = (
    state: FakeartistState,
    socketInfo: SocketInfo
): FakeartistState => {
    switch (socketInfo.status) {
        case 100: {
            // ルーム入室
            let next = dataSet(state, socketInfo.obj);
            if (socketInfo.userName === state.playerName) {
                next = {
                    ...next,
                    redrawSeq: next.redrawSeq + 1,
                    artDataStrokeList: socketInfo.obj.artDataStrokeList,
                };
            }
            return next;
        }
        case 101: // チャット
            return { ...state, chatList: socketInfo.obj };
        case 150: {
            // ルーム退出
            let next = dataSet(state, socketInfo.obj);
            if (socketInfo.userName === state.playerName) {
                next = { ...next, playerData: null };
            }
            return next;
        }
        case 160: // テーマ変更
            return { ...state, patternList: socketInfo.obj.patternList };
        case 200: {
            // 同一ユーザ入室(再入室)
            let next = {
                ...dataSet(state, socketInfo.obj),
                messageList: [...state.messageList, socketInfo.message],
            };
            if (socketInfo.userName === state.playerName) {
                next = {
                    ...next,
                    redrawSeq: next.redrawSeq + 1,
                    artDataStrokeList: socketInfo.obj.artDataStrokeList,
                };
            }
            return next;
        }
        case 300: // ゲーム開始
            return dataSet(
                {
                    ...state,
                    startFlg: true,
                    clearSeq: state.clearSeq + 1,
                    personCanvasZindex: -1,
                    disscuttionStartFlg: false,
                    votingStartFlg: false,
                    endFlg: false,
                },
                socketInfo.obj
            );
        case 404: // 例外
            return {
                ...state,
                messageList: [...state.messageList, socketInfo.message],
            };
        case 450: {
            // お絵描き
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const list: Array<any> = socketInfo.obj.artDataStrokeList;
            const last = list[list.length - 1];
            let next = state;

            // 別の人の絵を反映
            if (socketInfo.userName !== state.playerName) {
                next = {
                    ...next,
                    remoteStroke: last,
                    remoteStrokeSeq: next.remoteStrokeSeq + 1,
                };
            }

            // エンドフラグがある場合反映
            if (last.endFlg) {
                next = {
                    ...dataSet(next, socketInfo.obj),
                    artDataStrokeList: list,
                };
            }
            return next;
        }
        case 451: // お絵描き(通常)
            return state;
        case 500: {
            // 投票
            let next = dataSet(state, socketInfo.obj);
            if (socketInfo.obj.gameTime == 4) {
                next = { ...next, resultSeq: next.resultSeq + 1 };
            }
            return next;
        }
        case 550: // 制限時間変更
            return { ...state, limitTime: socketInfo.obj };
        case 600: // 制限時間超過
            return dataSet(state, socketInfo.obj);
        case 650: // アイコン変更
            return { ...state, userList: socketInfo.obj };
        case 998: // エラーメッセージ表示(個人)
            if (socketInfo.userName === state.playerName) {
                return {
                    ...state,
                    messageList: [...state.messageList, socketInfo.message],
                };
            }
            return state;
        case 999: // エラーメッセージ表示(全員)
            return {
                ...state,
                messageList: [...state.messageList, socketInfo.message],
            };
        default:
            return state;
    }
};

export const fakeartistReducer = (
    state: FakeartistState,
    action: FakeartistAction
): FakeartistState => {
    switch (action.type) {
        case 'message':
            return onMessage(state, action.payload);
        case 'roomIn':
            return { ...state, playerName: action.userName };
        case 'chatSent':
            return {
                ...state,
                messageList: [...state.messageList, action.message],
            };
        case 'systemMessage':
            return {
                ...state,
                messageList: [...state.messageList, action.text],
            };
        case 'dismissStart':
            return { ...state, startFlg: false };
        case 'dismissDisscuttionStart':
            return { ...state, disscuttionStartFlg: false };
        case 'dismissVotingStart':
            return { ...state, votingStartFlg: false };
        case 'showEnd':
            return { ...state, endFlg: true };
        case 'dismissEnd':
            return { ...state, endFlg: false };
        case 'setPersonCanvasZindex':
            return { ...state, personCanvasZindex: action.value };
        default:
            return state;
    }
};
