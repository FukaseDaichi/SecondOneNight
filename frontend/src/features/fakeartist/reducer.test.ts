import { describe, it, expect } from 'vitest';
import { fakeartistReducer, initialFakeartistState } from './reducer';
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
    gameTime: 0,
    theme: 'テーマ',
    endMessage: '',
    patternList: [1, 2],
    limitTime: 0,
    ...over,
});

const stroke = (over: Record<string, unknown> = {}) => ({
    artDataList: [
        { xparamPotision: 0, yparamPotision: 0 },
        { xparamPotision: 1, yparamPotision: 1 },
    ],
    name: 'other',
    color: '#000',
    lineWidth: 2,
    endFlg: false,
    ...over,
});

describe('fakeartistReducer: サーバメッセージ', () => {
    // 1. 入室(自分)
    it('status 100(自分の入室)で dataSet が反映され redrawSeq が +1、artDataStrokeList が反映される', () => {
        const before = { ...initialFakeartistState, playerName: 'me' };
        const s = fakeartistReducer(before, {
            type: 'message',
            payload: msg(
                100,
                serverObj({ artDataStrokeList: [stroke()] }),
                { userName: 'me' }
            ),
        });
        expect(s.turn).toBe(1);
        expect(s.redrawSeq).toBe(before.redrawSeq + 1);
        expect(s.artDataStrokeList).toEqual([stroke()]);
    });

    // 2. 入室(他人)
    it('status 100(他人の入室)で dataSet のみ反映され redrawSeq は不変', () => {
        const before = { ...initialFakeartistState, playerName: 'me' };
        const s = fakeartistReducer(before, {
            type: 'message',
            payload: msg(
                100,
                serverObj({ artDataStrokeList: [stroke()] }),
                { userName: 'other' }
            ),
        });
        expect(s.turn).toBe(1);
        expect(s.redrawSeq).toBe(before.redrawSeq);
    });

    // 3. チャット
    it('status 101(チャット)で chatList のみ更新される', () => {
        const s = fakeartistReducer(initialFakeartistState, {
            type: 'message',
            payload: msg(101, [{ text: 'hi' }]),
        });
        expect(s.chatList).toEqual([{ text: 'hi' }]);
        expect(s.userList).toEqual([]);
    });

    // 4. 退出(自分)
    it('status 150(自分の退出)で dataSet が反映され playerData が null になる', () => {
        const before = {
            ...initialFakeartistState,
            playerName: 'me',
            playerData: { userName: 'me' } as unknown as (typeof initialFakeartistState)['playerData'],
        };
        const s = fakeartistReducer(before, {
            type: 'message',
            payload: msg(150, serverObj(), { userName: 'me' }),
        });
        expect(s.playerData).toBeNull();
        expect(s.turn).toBe(1);
    });

    // 5. 退出(他人)
    it('status 150(他人の退出)で dataSet のみ反映され playerData は維持される', () => {
        const playerData = { userName: 'me' } as unknown as (typeof initialFakeartistState)['playerData'];
        const before = {
            ...initialFakeartistState,
            playerName: 'me',
            playerData,
        };
        const s = fakeartistReducer(before, {
            type: 'message',
            payload: msg(150, serverObj(), { userName: 'other' }),
        });
        expect(s.playerData).toBe(playerData);
    });

    // 6. テーマ変更
    it('status 160(テーマ変更)で patternList のみ更新される', () => {
        const s = fakeartistReducer(initialFakeartistState, {
            type: 'message',
            payload: msg(160, { patternList: [1, 3] }),
        });
        expect(s.patternList).toEqual([1, 3]);
        expect(s.turn).toBe(initialFakeartistState.turn);
    });

    // 7. 再入室
    it('status 200(再入室)で dataSet + messageList 追記 + redrawSeq +1 される', () => {
        const before = { ...initialFakeartistState, playerName: 'me' };
        const s = fakeartistReducer(before, {
            type: 'message',
            payload: msg(
                200,
                serverObj({ artDataStrokeList: [stroke()] }),
                { userName: 'me', message: '再入室' }
            ),
        });
        expect(s.messageList).toEqual(['再入室']);
        expect(s.redrawSeq).toBe(before.redrawSeq + 1);
        expect(s.artDataStrokeList).toEqual([stroke()]);
    });

    // 8. 開始
    it('status 300(開始)で startFlg true / clearSeq +1 / personCanvasZindex -1 / 各 view フラグが false になり dataSet が反映される', () => {
        const before = {
            ...initialFakeartistState,
            startFlg: false,
            personCanvasZindex: 1,
            disscuttionStartFlg: true,
            votingStartFlg: true,
            endFlg: true,
        };
        const s = fakeartistReducer(before, {
            type: 'message',
            payload: msg(300, serverObj({ turn: 0 })),
        });
        expect(s.startFlg).toBe(true);
        expect(s.clearSeq).toBe(before.clearSeq + 1);
        expect(s.personCanvasZindex).toBe(-1);
        expect(s.disscuttionStartFlg).toBe(false);
        expect(s.votingStartFlg).toBe(false);
        expect(s.endFlg).toBe(false);
        expect(s.turn).toBe(0);
    });

    // 9. 例外
    it('status 404(例外)で messageList のみ更新される', () => {
        const s = fakeartistReducer(initialFakeartistState, {
            type: 'message',
            payload: msg(404, null, { message: 'err' }),
        });
        expect(s.messageList).toEqual(['err']);
        expect(s.turn).toBe(initialFakeartistState.turn);
    });

    // 10. お絵描き(他人)
    it('status 450(他人のお絵描き)で remoteStroke/remoteStrokeSeq が更新され dataSet はされない', () => {
        const before = { ...initialFakeartistState, playerName: 'me' };
        const s1 = stroke({ name: 'other', endFlg: false });
        const s2 = stroke({ name: 'other', endFlg: false });
        const s = fakeartistReducer(before, {
            type: 'message',
            payload: msg(
                450,
                { artDataStrokeList: [s1, s2] },
                { userName: 'other' }
            ),
        });
        expect(s.remoteStroke).toEqual(s2);
        expect(s.remoteStrokeSeq).toBe(before.remoteStrokeSeq + 1);
        expect(s.turn).toBe(before.turn);
    });

    // 11. お絵描き(自分)
    it('status 450(自分のお絵描き)で remoteStrokeSeq は不変', () => {
        const before = { ...initialFakeartistState, playerName: 'me' };
        const s1 = stroke({ name: 'me', endFlg: false });
        const s = fakeartistReducer(before, {
            type: 'message',
            payload: msg(450, { artDataStrokeList: [s1] }, { userName: 'me' }),
        });
        expect(s.remoteStrokeSeq).toBe(before.remoteStrokeSeq);
    });

    // 12. お絵描き(endFlgあり)
    it('status 450(endFlg 付き)で dataSet が反映され artDataStrokeList が更新される', () => {
        const before = { ...initialFakeartistState, playerName: 'me' };
        const last = stroke({ name: 'me', endFlg: true });
        const list = [stroke({ name: 'other' }), last];
        const s = fakeartistReducer(before, {
            type: 'message',
            payload: msg(
                450,
                { ...serverObj({ turn: 2 }), artDataStrokeList: list },
                { userName: 'me' }
            ),
        });
        expect(s.turn).toBe(2);
        expect(s.artDataStrokeList).toEqual(list);
    });

    // 13. 450の両立
    it('status 450(他人 + endFlg)で remoteStrokeSeq が +1 されかつ dataSet が反映される', () => {
        const before = { ...initialFakeartistState, playerName: 'me' };
        const last = stroke({ name: 'other', endFlg: true });
        const list = [stroke({ name: 'other' }), last];
        const s = fakeartistReducer(before, {
            type: 'message',
            payload: msg(
                450,
                { ...serverObj({ turn: 3 }), artDataStrokeList: list },
                { userName: 'other' }
            ),
        });
        expect(s.remoteStroke).toEqual(last);
        expect(s.remoteStrokeSeq).toBe(before.remoteStrokeSeq + 1);
        expect(s.turn).toBe(3);
        expect(s.artDataStrokeList).toEqual(list);
    });

    // 14. 描き中
    it('status 451(描き中)で state が不変', () => {
        const s = fakeartistReducer(initialFakeartistState, {
            type: 'message',
            payload: msg(451, null),
        });
        expect(s).toBe(initialFakeartistState);
    });

    // 15. 投票
    it('status 500(gameTime 4)で dataSet が反映され resultSeq が +1 される', () => {
        const s = fakeartistReducer(initialFakeartistState, {
            type: 'message',
            payload: msg(500, serverObj({ gameTime: 4 })),
        });
        expect(s.gameTime).toBe(4);
        expect(s.resultSeq).toBe(initialFakeartistState.resultSeq + 1);
    });

    // 16. 投票(継続中)
    it('status 500(gameTime 3)で dataSet のみ反映され resultSeq は不変', () => {
        const s = fakeartistReducer(initialFakeartistState, {
            type: 'message',
            payload: msg(500, serverObj({ gameTime: 3 })),
        });
        expect(s.gameTime).toBe(3);
        expect(s.resultSeq).toBe(initialFakeartistState.resultSeq);
    });

    // 17. 制限時間 / 超過
    it('status 550(制限時間変更)で limitTime のみ更新される', () => {
        const s = fakeartistReducer(initialFakeartistState, {
            type: 'message',
            payload: msg(550, 120),
        });
        expect(s.limitTime).toBe(120);
        expect(s.turn).toBe(initialFakeartistState.turn);
    });

    it('status 600(制限時間超過)で dataSet が反映される', () => {
        const s = fakeartistReducer(initialFakeartistState, {
            type: 'message',
            payload: msg(600, serverObj({ turn: 5 })),
        });
        expect(s.turn).toBe(5);
    });

    // 18. アイコン
    it('status 650(アイコン変更)で userList のみ更新される', () => {
        const userList = [{ userName: 'b', userNo: 2, userIconUrl: 'x.jpg' }];
        const s = fakeartistReducer(initialFakeartistState, {
            type: 'message',
            payload: msg(650, userList),
        });
        expect(s.userList).toEqual(userList);
        expect(s.turn).toBe(initialFakeartistState.turn);
    });

    // 19. エラー系
    it('status 998(個人エラー)は自分宛のときのみ messageList に追記される', () => {
        const before = { ...initialFakeartistState, playerName: 'me' };
        const s = fakeartistReducer(before, {
            type: 'message',
            payload: msg(998, null, { userName: 'me', message: '本人' }),
        });
        expect(s.messageList).toEqual(['本人']);
    });

    it('status 998(個人エラー)は他人宛のとき state が不変', () => {
        const before = { ...initialFakeartistState, playerName: 'me' };
        const s = fakeartistReducer(before, {
            type: 'message',
            payload: msg(998, null, { userName: 'other', message: '他人' }),
        });
        expect(s).toBe(before);
    });

    it('status 999(全員エラー)で messageList に追記される', () => {
        const s = fakeartistReducer(initialFakeartistState, {
            type: 'message',
            payload: msg(999, null, { message: 'all' }),
        });
        expect(s.messageList).toEqual(['all']);
    });

    // 20. gameTime 演出
    it('dataSet 中に gameTime が 1→2 になると disscuttionStartFlg が true になる', () => {
        const before = { ...initialFakeartistState, gameTime: 1 };
        const s = fakeartistReducer(before, {
            type: 'message',
            payload: msg(600, serverObj({ gameTime: 2 })),
        });
        expect(s.disscuttionStartFlg).toBe(true);
        expect(s.votingStartFlg).toBe(false);
    });

    it('gameTime が 2 のまま変化しない場合は disscuttionStartFlg が変化しない', () => {
        const before = { ...initialFakeartistState, gameTime: 2 };
        const s = fakeartistReducer(before, {
            type: 'message',
            payload: msg(600, serverObj({ gameTime: 2 })),
        });
        expect(s.disscuttionStartFlg).toBe(false);
    });

    it('dataSet 中に gameTime が 2→3 になると votingStartFlg が true になる', () => {
        const before = { ...initialFakeartistState, gameTime: 2 };
        const s = fakeartistReducer(before, {
            type: 'message',
            payload: msg(600, serverObj({ gameTime: 3 })),
        });
        expect(s.votingStartFlg).toBe(true);
        expect(s.disscuttionStartFlg).toBe(false);
    });

    // 21. 未知 status
    it('未知 status では state が同一参照のまま変化しない', () => {
        const s = fakeartistReducer(initialFakeartistState, {
            type: 'message',
            payload: msg(777, serverObj()),
        });
        expect(s).toBe(initialFakeartistState);
    });

    // 21b. バックエンドはアクション拒否時、クライアント送信時の obj(null や
    // 描画データ等)をそのまま status=200(ApplicationException のデフォルト)で
    // 再配信する(FakeArtistController の catch)。room 形状でない obj では状態を変えない。
    it.each([100, 200, 300])(
        'status %i でも obj が room 形状でなければ state が不変(エラー再配信)',
        (status) => {
            const s = fakeartistReducer(initialFakeartistState, {
                type: 'message',
                payload: msg(status, null, { message: '対象のターンではありません' }),
            });
            expect(s).toBe(initialFakeartistState);
        }
    );

    it('playerData は userList 内の自分が見つかった時のみ更新され、見つからない場合は据え置かれる', () => {
        const before = { ...initialFakeartistState, playerName: 'me' };
        const s1 = fakeartistReducer(before, {
            type: 'message',
            payload: msg(
                100,
                serverObj({
                    userList: [{ userName: 'me', userNo: 1, userIconUrl: null }],
                }),
                { userName: 'other' }
            ),
        });
        expect(s1.playerData?.userName).toBe('me');

        const s2 = fakeartistReducer(s1, {
            type: 'message',
            payload: msg(
                600,
                serverObj({
                    userList: [{ userName: 'other', userNo: 2, userIconUrl: null }],
                })
            ),
        });
        expect(s2.playerData?.userName).toBe('me');
    });
});

describe('fakeartistReducer: ローカルアクション', () => {
    it('roomIn で playerName が設定される', () => {
        const s = fakeartistReducer(initialFakeartistState, { type: 'roomIn', userName: 'me' });
        expect(s.playerName).toBe('me');
    });

    it('chatSent / systemMessage で messageList に追記される', () => {
        let s = fakeartistReducer(initialFakeartistState, { type: 'chatSent', message: 'hi' });
        s = fakeartistReducer(s, { type: 'systemMessage', text: '通信エラー。再度試してください' });
        expect(s.messageList).toEqual(['hi', '通信エラー。再度試してください']);
    });

    it('dismissStart で startFlg が下りる', () => {
        const on = { ...initialFakeartistState, startFlg: true };
        expect(fakeartistReducer(on, { type: 'dismissStart' }).startFlg).toBe(false);
    });

    it('dismissDisscuttionStart / dismissVotingStart で各フラグが下りる', () => {
        let s = { ...initialFakeartistState, disscuttionStartFlg: true, votingStartFlg: true };
        s = fakeartistReducer(s, { type: 'dismissDisscuttionStart' });
        expect(s.disscuttionStartFlg).toBe(false);
        s = fakeartistReducer(s, { type: 'dismissVotingStart' });
        expect(s.votingStartFlg).toBe(false);
    });

    it('showEnd / dismissEnd で endFlg が切り替わる', () => {
        let s = fakeartistReducer(initialFakeartistState, { type: 'showEnd' });
        expect(s.endFlg).toBe(true);
        s = fakeartistReducer(s, { type: 'dismissEnd' });
        expect(s.endFlg).toBe(false);
    });

    it('setPersonCanvasZindex で personCanvasZindex が更新される', () => {
        let s = fakeartistReducer(initialFakeartistState, { type: 'setPersonCanvasZindex', value: 1 });
        expect(s.personCanvasZindex).toBe(1);
        s = fakeartistReducer(s, { type: 'setPersonCanvasZindex', value: -1 });
        expect(s.personCanvasZindex).toBe(-1);
    });
});
