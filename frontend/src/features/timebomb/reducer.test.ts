import { describe, it, expect } from 'vitest';
import { timebombReducer, initialTimebombState } from './reducer';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const msg = (status: number, over: Record<string, unknown> = {}): any => ({
    status,
    roomId: 'r1',
    userName: null,
    message: null,
    obj: null,
    ...over,
});

// room オブジェクト直渡し形式(現行 setData が読むフィールド)
const serverRoom = (over: Record<string, unknown> = {}) => ({
    userList: [{ userName: 'a', userNo: 1, userIconUrl: null, turnFlg: false }],
    turn: 0,
    releaseNo: 0,
    limitTime: 0,
    secretFlg: false,
    leadCardsList: [{ cardType: 1, openFlg: false }],
    round: 0,
    winnerTeam: 0,
    ...over,
});

describe('timebombReducer: サーバメッセージ(status 系)', () => {
    it('status 200 で messageList に入室メッセージが追加され room が反映される', () => {
        const s = timebombReducer(initialTimebombState, {
            type: 'message',
            payload: msg(200, { message: '入室', obj: serverRoom({ turn: 3 }) }),
        });
        expect(s.messageList).toEqual(['入室']);
        expect(s.turn).toBe(3);
        expect(s.timeBombUserList).toEqual(serverRoom().userList);
    });

    it('status 201 で timeBombUserList のみ更新される', () => {
        const userList = [{ userName: 'b', userNo: 2, userIconUrl: 'x.jpg' }];
        const s = timebombReducer(initialTimebombState, {
            type: 'message',
            payload: msg(201, { obj: userList }),
        });
        expect(s.timeBombUserList).toEqual(userList);
        expect(s.turn).toBe(initialTimebombState.turn);
    });

    it('status 404 で messageList のみ追記される', () => {
        const s = timebombReducer(initialTimebombState, {
            type: 'message',
            payload: msg(404, { message: 'err' }),
        });
        expect(s.messageList).toEqual(['err']);
        expect(s.turn).toBe(initialTimebombState.turn);
    });

    it('status 800 で secretFlg が更新される', () => {
        const s = timebombReducer(initialTimebombState, {
            type: 'message',
            payload: msg(800, { obj: true }),
        });
        expect(s.secretFlg).toBe(true);
    });

    it('status 900 で limitTime が更新される', () => {
        const s = timebombReducer(initialTimebombState, {
            type: 'message',
            payload: msg(900, { obj: 300 }),
        });
        expect(s.limitTime).toBe(300);
    });

    it('未知 status(現行 default)は messageList に追記される', () => {
        const s = timebombReducer(initialTimebombState, {
            type: 'message',
            payload: msg(555, { message: 'other' }),
        });
        expect(s.messageList).toEqual(['other']);
    });
});

describe('timebombReducer: room オブジェクト直渡し形式', () => {
    it('データ反映: 6フィールドが反映され endFlg が false になる', () => {
        const before = { ...initialTimebombState, endFlg: true };
        const s = timebombReducer(before, {
            type: 'message',
            payload: serverRoom({ turn: 3 }),
        });
        expect(s.timeBombUserList).toEqual(serverRoom().userList);
        expect(s.turn).toBe(3);
        expect(s.releaseNo).toBe(0);
        expect(s.limitTime).toBe(0);
        expect(s.secretFlg).toBe(false);
        expect(s.leadCardsList).toEqual(serverRoom().leadCardsList);
        expect(s.endFlg).toBe(false);
    });

    it('解除成功: releaseNo が増加すると messageList 末尾に「解除に成功」が追加される', () => {
        const before = { ...initialTimebombState, releaseNo: 1 };
        const s = timebombReducer(before, {
            type: 'message',
            payload: serverRoom({ releaseNo: 2 }),
        });
        expect(s.messageList[s.messageList.length - 1]).toBe('解除に成功');
        expect(s.releaseNo).toBe(2);
    });

    it('開始判定: turn===1 で startFlg が立ち bommer/police がリセットされる', () => {
        const before = {
            ...initialTimebombState,
            bommerFlg: true,
            policeFlg: true,
        };
        const s = timebombReducer(before, {
            type: 'message',
            payload: serverRoom({ turn: 1 }),
        });
        expect(s.startFlg).toBe(true);
        expect(s.bommerFlg).toBe(false);
        expect(s.policeFlg).toBe(false);
    });

    it('警察勝利: winnerTeam===1 で policeFlg・endFlg が true になる', () => {
        const s = timebombReducer(initialTimebombState, {
            type: 'message',
            payload: serverRoom({ winnerTeam: 1 }),
        });
        expect(s.policeFlg).toBe(true);
        expect(s.endFlg).toBe(true);
    });

    it('爆弾勝利: winnerTeam===2 で bommerFlg・endFlg が true になる', () => {
        const s = timebombReducer(initialTimebombState, {
            type: 'message',
            payload: serverRoom({ winnerTeam: 2 }),
        });
        expect(s.bommerFlg).toBe(true);
        expect(s.endFlg).toBe(true);
    });

    it('ラウンド進行: round が変化し winnerTeam===0 のとき round が進み roundMessageFlg が立つ', () => {
        const before = { ...initialTimebombState, round: 1 };
        const s = timebombReducer(before, {
            type: 'message',
            payload: serverRoom({ round: 2, winnerTeam: 0 }),
        });
        expect(s.round).toBe(2);
        expect(s.roundMessageFlg).toBe(true);
    });

    it('ラウンド1は演出なし: round 0→1 では roundMessageFlg は立たない', () => {
        const before = { ...initialTimebombState, round: 0 };
        const s = timebombReducer(before, {
            type: 'message',
            payload: serverRoom({ round: 1 }),
        });
        expect(s.round).toBe(1);
        expect(s.roundMessageFlg).toBe(false);
    });

    it('leadCardsList 無し: room.leadCardsList が無い場合、既存の leadCardsList が据え置かれる', () => {
        const existingLeadCards = [{ cardType: 9, openFlg: true }];
        const before = { ...initialTimebombState, leadCardsList: existingLeadCards };
        const room = serverRoom();
        delete (room as Record<string, unknown>).leadCardsList;
        const s = timebombReducer(before, {
            type: 'message',
            payload: room,
        });
        expect(s.leadCardsList).toEqual(existingLeadCards);
    });

    it('解除成功とラウンド進行が同時発生: 解除メッセージ追加・round更新・roundMessageFlg立ち上げが全て反映され勝敗フラグは立たない', () => {
        const before = { ...initialTimebombState, round: 1, releaseNo: 1 };
        const s = timebombReducer(before, {
            type: 'message',
            payload: serverRoom({ releaseNo: 2, round: 2, winnerTeam: 0 }),
        });
        expect(s.messageList[s.messageList.length - 1]).toBe('解除に成功');
        expect(s.round).toBe(2);
        expect(s.roundMessageFlg).toBe(true);
        expect(s.bommerFlg).toBe(false);
        expect(s.policeFlg).toBe(false);
    });
});

describe('timebombReducer: ローカルアクション', () => {
    it('roomIn / systemMessage / dismissStart / dismissRoundMessage で各フィールドが更新される', () => {
        let s = timebombReducer(initialTimebombState, { type: 'roomIn', userName: 'me' });
        expect(s.playerName).toBe('me');

        s = timebombReducer(s, { type: 'systemMessage', text: '通信エラー。再度試してください' });
        expect(s.messageList).toEqual(['通信エラー。再度試してください']);

        const started = { ...s, startFlg: true, roundMessageFlg: true };
        const afterDismissStart = timebombReducer(started, { type: 'dismissStart' });
        expect(afterDismissStart.startFlg).toBe(false);

        const afterDismissRound = timebombReducer(started, { type: 'dismissRoundMessage' });
        expect(afterDismissRound.roundMessageFlg).toBe(false);
    });

    it('未知の action type では state が同一参照のまま変化しない', () => {
        // @ts-expect-error 型で表現されない未知の action type を敢えて渡す
        const s = timebombReducer(initialTimebombState, { type: 'unknown' });
        expect(s).toBe(initialTimebombState);
    });
});
