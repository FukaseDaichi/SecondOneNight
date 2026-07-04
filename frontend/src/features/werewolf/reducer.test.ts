import { describe, it, expect } from 'vitest';
import { werewolfReducer, initialWerewolfState } from './reducer';
import type { SocketInfo } from '../../type';

const msg = (status: number, obj: unknown, over: Partial<SocketInfo> = {}): SocketInfo => ({
    status,
    roomId: 'r1',
    userName: null,
    message: null,
    obj,
    ...over,
});

// 現行 dataSet が読む6フィールドを持つサーバ obj
const serverObj = (over: Record<string, unknown> = {}) => ({
    userList: [{ userName: 'a', userNo: 1, userIconUrl: null }],
    winteamList: [],
    turn: 1,
    staticRollList: [{ rollNo: 1, teamNo: 1 }],
    rollList: [{ rollNo: 1, teamNo: 1 }],
    npcuser: null,
    ...over,
});

describe('werewolfReducer: サーバメッセージ', () => {
    it.each([100, 200])(
        'status %i で dataSet + limitTime + counterMap + rollInfoList が反映される',
        (status) => {
            const s = werewolfReducer(initialWerewolfState, {
                type: 'message',
                payload: msg(
                    status,
                    serverObj({
                        turn: 2,
                        limitTime: 180,
                        rollNoList: [1, 1, 2],
                        rollList: [{ rollNo: 1 }, { rollNo: 2 }],
                    })
                ),
            });
            expect(s.userList).toEqual([{ userName: 'a', userNo: 1, userIconUrl: null }]);
            expect(s.turn).toBe(2);
            expect(s.limitTime).toBe(180);
            expect(s.counterMap).toEqual({ 1: 2, 2: 1 });
            expect(s.rollInfoList).toEqual([{ rollNo: 1 }, { rollNo: 2 }]);
        }
    );

    it('status 100 で roomCode を取り込む', () => {
        const s = werewolfReducer(initialWerewolfState, {
            type: 'message',
            payload: msg(100, serverObj({ roomCode: '123456' })),
        });
        expect(s.roomCode).toBe('123456');
    });

    it('status 130 でuserListが更新される(退出)', () => {
        const before = {
            ...initialWerewolfState,
            playerName: 'a',
            userList: [
                { userName: 'a', userNo: 1 },
                { userName: 'b', userNo: 2 },
            ],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
        const s = werewolfReducer(before, {
            type: 'message',
            payload: msg(
                130,
                {
                    userList: [{ userName: 'a', userNo: 1 }],
                    winteamList: [],
                    turn: 0,
                    staticRollList: [],
                    rollList: [],
                    npcuser: null,
                    rollNoList: [],
                },
                { userName: 'a' }
            ),
        });
        expect(s.userList).toHaveLength(1);
        expect(s.userList[0].userName).toBe('a');
    });

    it('status 150(役職設定)で dataSet + counterMap + rollInfoList が反映され limitTime は据え置かれる', () => {
        const before = { ...initialWerewolfState, limitTime: 300 };
        const s = werewolfReducer(before, {
            type: 'message',
            payload: msg(
                150,
                serverObj({
                    turn: 0,
                    rollNoList: [3, 3, 3],
                    rollList: [{ rollNo: 3 }],
                })
            ),
        });
        expect(s.counterMap).toEqual({ 3: 3 });
        expect(s.rollInfoList).toEqual([{ rollNo: 3 }]);
        expect(s.limitTime).toBe(300);
    });

    it('status 101(チャット)で chatList のみ更新される', () => {
        const s = werewolfReducer(initialWerewolfState, {
            type: 'message',
            payload: msg(101, [{ text: 'hi' }]),
        });
        expect(s.chatList).toEqual([{ text: 'hi' }]);
        expect(s.userList).toEqual([]);
    });

    it('status 300(開始)で startFlg が立ち ruleFlg/resultFlg が下り dataSet が反映される', () => {
        const before = { ...initialWerewolfState, ruleFlg: true, resultFlg: true };
        const s = werewolfReducer(before, {
            type: 'message',
            payload: msg(300, serverObj({ turn: 1 })),
        });
        expect(s.startFlg).toBe(true);
        expect(s.ruleFlg).toBe(false);
        expect(s.resultFlg).toBe(false);
        expect(s.turn).toBe(1);
    });

    it('status 400(役職選択)で dataSet のみ反映される', () => {
        const s = werewolfReducer(initialWerewolfState, {
            type: 'message',
            payload: msg(400, serverObj({ turn: 2 })),
        });
        expect(s.turn).toBe(2);
    });

    it('status 404(例外)で messageList のみ更新される', () => {
        const s = werewolfReducer(initialWerewolfState, {
            type: 'message',
            payload: msg(404, null, { message: 'err' }),
        });
        expect(s.messageList).toEqual(['err']);
        expect(s.userList).toEqual(initialWerewolfState.userList);
    });

    it('status 500(独裁者アクション)で cutInNo=6 かつ snipeSeq が +1 される', () => {
        const s = werewolfReducer(initialWerewolfState, {
            type: 'message',
            payload: msg(
                500,
                serverObj({
                    userList: [
                        {
                            userName: 'a',
                            userNo: 0,
                            userIconUrl: null,
                            roll: { rollNo: 6 },
                            lastMessage: null,
                        },
                    ],
                }),
                { message: '0' }
            ),
        });
        expect(s.cutInNo).toBe(6);
        expect(s.snipeSeq).toBe(initialWerewolfState.snipeSeq + 1);
    });

    it('status 500(暗殺者アクション)で cutInNo=10 かつ snipeSeq が +1 される', () => {
        const s = werewolfReducer(initialWerewolfState, {
            type: 'message',
            payload: msg(
                500,
                serverObj({
                    userList: [
                        {
                            userName: 'a',
                            userNo: 0,
                            userIconUrl: null,
                            roll: { rollNo: 10 },
                            lastMessage: null,
                        },
                    ],
                }),
                { message: '0' }
            ),
        });
        expect(s.cutInNo).toBe(10);
        expect(s.snipeSeq).toBe(initialWerewolfState.snipeSeq + 1);
    });

    it('status 500(占い師・本人)で cutInNo=8 が立ち snipeSeq は変化しない', () => {
        const before = { ...initialWerewolfState, playerName: 'me' };
        const s = werewolfReducer(before, {
            type: 'message',
            payload: msg(
                500,
                serverObj({
                    userList: [
                        {
                            userName: 'me',
                            userNo: 0,
                            userIconUrl: null,
                            roll: { rollNo: 8 },
                            lastMessage: null,
                        },
                    ],
                }),
                { message: '0' }
            ),
        });
        expect(s.cutInNo).toBe(8);
        expect(s.snipeSeq).toBe(before.snipeSeq);
    });

    it('status 500(占い師・他人)で cutInNo は変化しない', () => {
        const before = { ...initialWerewolfState, playerName: 'me' };
        const s = werewolfReducer(before, {
            type: 'message',
            payload: msg(
                500,
                serverObj({
                    userList: [
                        {
                            userName: 'other',
                            userNo: 0,
                            userIconUrl: null,
                            roll: { rollNo: 8 },
                            lastMessage: null,
                        },
                    ],
                }),
                { message: '0' }
            ),
        });
        expect(s.cutInNo).toBe(before.cutInNo);
    });

    it('status 500(怪盗・本人)で cutInNo=11 が立つ', () => {
        const before = { ...initialWerewolfState, playerName: 'me' };
        const s = werewolfReducer(before, {
            type: 'message',
            payload: msg(
                500,
                serverObj({
                    userList: [
                        {
                            userName: 'me',
                            userNo: 0,
                            userIconUrl: null,
                            roll: { rollNo: 7 },
                            lastMessage: '怪盗した。',
                        },
                    ],
                }),
                { message: '0' }
            ),
        });
        expect(s.cutInNo).toBe(11);
    });

    it('status 550(制限時間)で limitTime のみ更新される', () => {
        const s = werewolfReducer(initialWerewolfState, {
            type: 'message',
            payload: msg(550, 300),
        });
        expect(s.limitTime).toBe(300);
        expect(s.turn).toBe(initialWerewolfState.turn);
    });

    it('status 600(ターン変更)で dataSet のみ反映される', () => {
        const s = werewolfReducer(initialWerewolfState, {
            type: 'message',
            payload: msg(600, serverObj({ turn: 3 })),
        });
        expect(s.turn).toBe(3);
    });

    it('status 650(アイコン変更)で userList のみ更新される', () => {
        const userList = [{ userName: 'b', userNo: 2, userIconUrl: 'x.jpg' }];
        const s = werewolfReducer(initialWerewolfState, {
            type: 'message',
            payload: msg(650, userList),
        });
        expect(s.userList).toEqual(userList);
        expect(s.turn).toBe(initialWerewolfState.turn);
    });

    it('status 700(投票)で dataSet + counterMap が反映される', () => {
        const s = werewolfReducer(initialWerewolfState, {
            type: 'message',
            payload: msg(700, serverObj({ turn: 4, rollNoList: [3] })),
        });
        expect(s.turn).toBe(4);
        expect(s.counterMap).toEqual({ 3: 1 });
    });

    it('status 998(個人エラー)は自分宛のときのみ messageList に追記される', () => {
        const before = { ...initialWerewolfState, playerName: 'me' };
        const s = werewolfReducer(before, {
            type: 'message',
            payload: msg(998, null, { userName: 'me', message: '本人' }),
        });
        expect(s.messageList).toEqual(['本人']);
    });

    it('status 998(個人エラー)は他人宛のとき state が不変', () => {
        const before = { ...initialWerewolfState, playerName: 'me' };
        const s = werewolfReducer(before, {
            type: 'message',
            payload: msg(998, null, { userName: 'other', message: '他人' }),
        });
        expect(s).toBe(before);
    });

    it('status 999(全員エラー)で messageList に追記される', () => {
        const s = werewolfReducer(initialWerewolfState, {
            type: 'message',
            payload: msg(999, null, { message: 'all' }),
        });
        expect(s.messageList).toEqual(['all']);
    });

    it('playerData は userList 内の自分が見つかった時のみ更新され、見つからない場合は据え置かれる', () => {
        const before = { ...initialWerewolfState, playerName: 'me' };
        const s1 = werewolfReducer(before, {
            type: 'message',
            payload: msg(
                100,
                serverObj({
                    userList: [{ userName: 'me', userNo: 1, userIconUrl: null }],
                })
            ),
        });
        expect(s1.playerData?.userName).toBe('me');

        const s2 = werewolfReducer(s1, {
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
        const s = werewolfReducer(initialWerewolfState, {
            type: 'message',
            payload: msg(777, serverObj()),
        });
        expect(s).toBe(initialWerewolfState);
    });
});

describe('werewolfReducer: ローカルアクション', () => {
    it('roomIn で playerName が設定される', () => {
        const s = werewolfReducer(initialWerewolfState, { type: 'roomIn', userName: 'me' });
        expect(s.playerName).toBe('me');
    });

    it('chatSent / systemMessage で messageList に追記される', () => {
        let s = werewolfReducer(initialWerewolfState, { type: 'chatSent', message: 'hi' });
        s = werewolfReducer(s, { type: 'systemMessage', text: '通信エラー。再度試してください' });
        expect(s.messageList).toEqual(['hi', '通信エラー。再度試してください']);
    });

    it('dismissStart で startFlg が下りる', () => {
        const on = { ...initialWerewolfState, startFlg: true };
        expect(werewolfReducer(on, { type: 'dismissStart' }).startFlg).toBe(false);
    });

    it('counter でクランプされつつ増減する(15 で頭打ち、0 未満にならない)', () => {
        let s = initialWerewolfState;
        for (let i = 0; i < 16; i++) {
            s = werewolfReducer(s, { type: 'counter', rollNo: 1, delta: 1 });
        }
        expect(s.counterMap[1]).toBe(15);

        for (let i = 0; i < 20; i++) {
            s = werewolfReducer(s, { type: 'counter', rollNo: 1, delta: -1 });
        }
        expect(s.counterMap[1]).toBe(0);
    });

    it('setModalRoll / setModalOwnFlg / setRuleFlg / setResultFlg / setRollSelectTurnFlg / setVotingStartFlg / clearCutIn / setWinMessage が各値を更新する', () => {
        const roll = { rollNo: 1, teamNo: 1 } as unknown as import('../../type/werewolf').WerewolfRoll;
        let s = werewolfReducer(initialWerewolfState, { type: 'setModalRoll', roll });
        expect(s.modalRoll).toEqual(roll);
        s = werewolfReducer(s, { type: 'setModalOwnFlg', value: true });
        expect(s.modalOwnFlg).toBe(true);
        s = werewolfReducer(s, { type: 'setRuleFlg', value: true });
        expect(s.ruleFlg).toBe(true);
        s = werewolfReducer(s, { type: 'setResultFlg', value: true });
        expect(s.resultFlg).toBe(true);
        s = werewolfReducer(s, { type: 'setRollSelectTurnFlg', value: true });
        expect(s.rollSelectTurnFlg).toBe(true);
        s = werewolfReducer(s, { type: 'setVotingStartFlg', value: true });
        expect(s.votingStartFlg).toBe(true);
        s = werewolfReducer({ ...s, cutInNo: 6 }, { type: 'clearCutIn' });
        expect(s.cutInNo).toBe(0);
        s = werewolfReducer(s, { type: 'setWinMessage', message: '人狼陣営' });
        expect(s.winMessage).toBe('人狼陣営');
    });
});
