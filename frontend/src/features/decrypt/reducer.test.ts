import { describe, it, expect } from 'vitest';
import { decryptReducer, initialDecryptState } from './reducer';
import type { SocketInfo } from '../../type';

const msg = (status: number, obj: unknown, over: Partial<SocketInfo> = {}): SocketInfo => ({
    status,
    roomId: 'r1',
    userName: null,
    message: null,
    obj,
    ...over,
});

// 現行 dataSet が読む7フィールドを持つサーバ obj
const serverObj = (over: Record<string, unknown> = {}) => ({
    userList: [{ userName: 'a', userNo: 1, userIconUrl: null }],
    turn: 1,
    gameTime: 60,
    choiceMode: 0,
    winnerTeam: 0,
    leftTeam: null,
    rightTeam: null,
    ...over,
});

describe('decryptReducer: サーバメッセージ', () => {
    it.each([100, 110, 120, 130, 140, 350, 370, 500])(
        'status %i で obj の7フィールドが state に反映される',
        (status) => {
            const s = decryptReducer(initialDecryptState, {
                type: 'message',
                payload: msg(status, serverObj({ turn: 2 })),
            });
            expect(s.userList).toEqual([{ userName: 'a', userNo: 1, userIconUrl: null }]);
            expect(s.turn).toBe(2);
            expect(s.gameTime).toBe(60);
            expect(s.choiceMode).toBe(0);
            expect(s.winnerTeam).toBe(0);
            expect(s.leftTeam).toBeNull();
            expect(s.rightTeam).toBeNull();
        }
    );

    it('status 101(チャット)で chatList のみ更新される', () => {
        const s = decryptReducer(initialDecryptState, {
            type: 'message',
            payload: msg(101, [{ text: 'hi' }]),
        });
        expect(s.chatList).toEqual([{ text: 'hi' }]);
        expect(s.userList).toEqual([]);
    });

    it('status 200(同一ユーザ入室)で dataSet が反映され messageList 末尾に再入室メッセージが追加される', () => {
        const s = decryptReducer(initialDecryptState, {
            type: 'message',
            payload: msg(200, serverObj(), { message: '再入室' }),
        });
        expect(s.turn).toBe(1);
        expect(s.messageList).toEqual(['再入室']);
    });

    it('status 300(開始)で startFlg が立ち dataSet が反映される', () => {
        const s = decryptReducer(initialDecryptState, {
            type: 'message',
            payload: msg(300, serverObj()),
        });
        expect(s.startFlg).toBe(true);
        expect(s.turn).toBe(1);
    });

    it('status 404(例外)で messageList のみ更新され他は不変', () => {
        const s = decryptReducer(initialDecryptState, {
            type: 'message',
            payload: msg(404, null, { message: 'err' }),
        });
        expect(s.messageList).toEqual(['err']);
        expect(s.userList).toEqual(initialDecryptState.userList);
        expect(s.turn).toBe(initialDecryptState.turn);
    });

    it('status 650(アイコン変更)で userList のみ更新される', () => {
        const userList = [{ userName: 'b', userNo: 2, userIconUrl: 'x.jpg' }];
        const s = decryptReducer(initialDecryptState, {
            type: 'message',
            payload: msg(650, userList),
        });
        expect(s.userList).toEqual(userList);
        expect(s.turn).toBe(initialDecryptState.turn);
    });

    it('status 998(個人エラー)は自分宛のときのみ messageList に追記される', () => {
        const before = { ...initialDecryptState, playerName: 'me' };
        const s = decryptReducer(before, {
            type: 'message',
            payload: msg(998, null, { userName: 'me', message: '本人' }),
        });
        expect(s.messageList).toEqual(['本人']);
    });

    it('status 998(個人エラー)は他人宛のとき state が不変', () => {
        const before = { ...initialDecryptState, playerName: 'me' };
        const s = decryptReducer(before, {
            type: 'message',
            payload: msg(998, null, { userName: 'other', message: '他人' }),
        });
        expect(s).toBe(before);
    });

    it('status 999(全員エラー)で messageList に追記される', () => {
        const s = decryptReducer(initialDecryptState, {
            type: 'message',
            payload: msg(999, null, { message: 'all' }),
        });
        expect(s.messageList).toEqual(['all']);
    });

    it('playerData は userList 内の自分が見つかった時のみ更新され、見つからない場合は据え置かれる', () => {
        const before = { ...initialDecryptState, playerName: 'me' };
        const s1 = decryptReducer(before, {
            type: 'message',
            payload: msg(
                100,
                serverObj({
                    userList: [{ userName: 'me', userNo: 1, userIconUrl: null }],
                })
            ),
        });
        expect(s1.playerData?.userName).toBe('me');

        // me がいない userList を後続で受けても playerData は据え置き
        const s2 = decryptReducer(s1, {
            type: 'message',
            payload: msg(
                100,
                serverObj({
                    userList: [{ userName: 'other', userNo: 2, userIconUrl: null }],
                })
            ),
        });
        expect(s2.playerData?.userName).toBe('me');
    });

    it('未知 status では state が同一参照のまま変化しない', () => {
        const s = decryptReducer(initialDecryptState, {
            type: 'message',
            payload: msg(777, serverObj()),
        });
        expect(s).toBe(initialDecryptState);
    });
});

describe('decryptReducer: ローカルアクション', () => {
    it('roomIn で playerName が設定される', () => {
        const s = decryptReducer(initialDecryptState, { type: 'roomIn', userName: 'me' });
        expect(s.playerName).toBe('me');
    });

    it('chatSent / systemMessage で messageList に追記される', () => {
        let s = decryptReducer(initialDecryptState, { type: 'chatSent', message: 'hi' });
        s = decryptReducer(s, { type: 'systemMessage', text: '通信エラー。再度試してください' });
        expect(s.messageList).toEqual(['hi', '通信エラー。再度試してください']);
    });

    it('dismissStart で startFlg が下りる', () => {
        const on = { ...initialDecryptState, startFlg: true };
        expect(decryptReducer(on, { type: 'dismissStart' }).startFlg).toBe(false);
    });
});
