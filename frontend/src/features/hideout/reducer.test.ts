import { describe, it, expect } from 'vitest';
import { hideoutReducer, initialHideoutState } from './reducer';
import type { SocketInfo } from '../../type';

const msg = (status: number, obj: unknown, over: Partial<SocketInfo> = {}): SocketInfo => ({
    status,
    roomId: 'r1',
    userName: null,
    message: null,
    obj,
    ...over,
});

// 現行 dataSet が読む9フィールドを持つサーバ obj
const serverObj = (over: Record<string, unknown> = {}) => ({
    userList: [{ userName: 'a', userNo: 1, userIconUrl: null }],
    rushFlg: false,
    firldBuilding: null,
    memberFirldList: [],
    waitUserIndexList: [],
    winnerTeam: 0,
    memberCardList: [{ card: 1 }],
    buildingCardList: [],
    turn: 1,
    ...over,
});

describe('hideoutReducer: サーバメッセージ', () => {
    it('status 100(入室)で obj の9フィールドが state に反映される', () => {
        const s = hideoutReducer(initialHideoutState, {
            type: 'message',
            payload: msg(100, serverObj()),
        });
        expect(s.userList).toEqual([{ userName: 'a', userNo: 1, userIconUrl: null }]);
        expect(s.turn).toBe(1);
        expect(s.memberCardList).toEqual([{ card: 1 }]);
    });

    it('status 101(チャット)で chatList のみ更新される', () => {
        const s = hideoutReducer(initialHideoutState, {
            type: 'message',
            payload: msg(101, [{ text: 'hi' }]),
        });
        expect(s.chatList).toEqual([{ text: 'hi' }]);
        expect(s.userList).toEqual([]);
    });

    it('status 300(開始)で startFlg が立ち、勝敗・ラッシュ表示がリセットされる', () => {
        const before = {
            ...initialHideoutState,
            swatWinFlg: true,
            terroristWinFlg: true,
            rushAreaFlg: true,
        };
        const s = hideoutReducer(before, { type: 'message', payload: msg(300, serverObj()) });
        expect(s.startFlg).toBe(true);
        expect(s.swatWinFlg).toBe(false);
        expect(s.terroristWinFlg).toBe(false);
        expect(s.rushAreaFlg).toBe(false);
    });

    it('rushFlg が false→true に変化したときのみ rushAreaFlg が立つ', () => {
        const s1 = hideoutReducer(initialHideoutState, {
            type: 'message',
            payload: msg(400, serverObj({ rushFlg: true })),
        });
        expect(s1.rushAreaFlg).toBe(true);
        // すでに rushFlg=true の状態で再度 rushFlg=true を受けても再点灯しない
        const closed = { ...s1, rushAreaFlg: false };
        const s2 = hideoutReducer(closed, {
            type: 'message',
            payload: msg(400, serverObj({ rushFlg: true })),
        });
        expect(s2.rushAreaFlg).toBe(false);
    });

    it('winnerTeam が 0→1 で swatWinFlg、0→2 で terroristWinFlg が立つ', () => {
        const s1 = hideoutReducer(initialHideoutState, {
            type: 'message',
            payload: msg(500, serverObj({ winnerTeam: 1 })),
        });
        expect(s1.swatWinFlg).toBe(true);
        const s2 = hideoutReducer(initialHideoutState, {
            type: 'message',
            payload: msg(500, serverObj({ winnerTeam: 2 })),
        });
        expect(s2.terroristWinFlg).toBe(true);
    });

    it('turn か rushFlg が変化したとき viewMemberCardList が更新される', () => {
        const s = hideoutReducer(initialHideoutState, {
            type: 'message',
            payload: msg(100, serverObj({ turn: 2, memberCardList: [{ card: 9 }] })),
        });
        expect(s.viewMemberCardList).toEqual([{ card: 9 }]);
        // turn / rushFlg 不変なら viewMemberCardList は据え置き
        const s2 = hideoutReducer(s, {
            type: 'message',
            payload: msg(100, serverObj({ turn: 2, memberCardList: [{ card: 10 }] })),
        });
        expect(s2.viewMemberCardList).toEqual([{ card: 9 }]);
    });

    it('status 600(アイコン変更)で userList のみ更新される', () => {
        const s = hideoutReducer(initialHideoutState, {
            type: 'message',
            payload: msg(600, [{ userName: 'b', userNo: 2, userIconUrl: 'x.jpg' }]),
        });
        expect(s.userList[0].userName).toBe('b');
        expect(s.turn).toBe(0);
    });

    it('未知 status では state が変化しない', () => {
        const s = hideoutReducer(initialHideoutState, {
            type: 'message',
            payload: msg(777, serverObj()),
        });
        expect(s).toBe(initialHideoutState);
    });
});

describe('hideoutReducer: ローカルアクション', () => {
    it('roomIn で playerName が設定される', () => {
        const s = hideoutReducer(initialHideoutState, { type: 'roomIn', userName: 'me' });
        expect(s.playerName).toBe('me');
    });

    it('chatSent / systemMessage で messageList に追記される', () => {
        let s = hideoutReducer(initialHideoutState, { type: 'chatSent', message: 'hi' });
        s = hideoutReducer(s, { type: 'systemMessage', text: '通信エラー。再度試してください' });
        expect(s.messageList).toEqual(['hi', '通信エラー。再度試してください']);
    });

    it('dismissStart / closeRushArea / dismiss*Win で各フラグが下りる', () => {
        const on = {
            ...initialHideoutState,
            startFlg: true,
            rushAreaFlg: true,
            swatWinFlg: true,
            terroristWinFlg: true,
        };
        expect(hideoutReducer(on, { type: 'dismissStart' }).startFlg).toBe(false);
        expect(hideoutReducer(on, { type: 'closeRushArea' }).rushAreaFlg).toBe(false);
        expect(hideoutReducer(on, { type: 'dismissSwatWin' }).swatWinFlg).toBe(false);
        expect(hideoutReducer(on, { type: 'dismissTerroristWin' }).terroristWinFlg).toBe(false);
    });
});
