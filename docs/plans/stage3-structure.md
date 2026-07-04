# Stage 3: ゲームごとの構造リファクタ 実装計画

> 状態: 進行中(2026-07-04 時点で Task 1〜12 実装済み。残りは Task 13 の完了検証)
> Stage 3 完了時: 検証記録の要点と残課題を `docs/roadmap.md` に吸収し、本ファイルを削除する

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 5ゲームの受信ハンドラ(status switch)を純粋関数の reducer に変換してユニットテストを整備し、god component を feature 構造に分割して、各ページを薄い入り口(目安100行以下)にする。

**Architecture:** ゲームごとに `src/features/<game>/`(reducer.ts + types.ts + use\<Game\>Room.ts + components/)を作る。reducer は「サーバ受信メッセージ + ローカルUIアクション」を受ける純粋関数。副作用(スクロール・タイマー・Audio・canvas・bodyクラス)はフック内の useEffect に分離。設計書: `docs/architecture/frontend.md(旧: Stage 3 設計書を吸収)`

**Tech Stack:** React 19 useReducer / @stomp/stompjs(既存 useGameSocket)/ Vitest

## Global Constraints

- 作業ブランチ: `feature/stage3-structure`(master から作成済み)。push / PR 作成はユーザーの指示があるまで行わない。PR は Stage 3 全体で1本
- 実行ディレクトリ: `frontend/`。bash コマンドは `frontend/` をカレントとする。`docs/...` はリポジトリルート基準
- コミットメッセージは日本語の短文。末尾に `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` を付ける
- **バックエンド仕様・通信内容は変更不可**: 送信 destination / payload / 購読 topic は現状と完全一致を維持(timebomb のみ `/topic/{roomId}/timebomb`、他は `/topic/{roomId}`)
- **状態遷移ロジックは挙動維持**。現行 useEffect の「変化時のみ発火」という性質は、reducer 内で前回値との比較ガード(例: `obj.rushFlg && !state.rushFlg`)で再現する
- 意図的な挙動差分(stale closure 修正・DOM直接操作の state 化に伴うもの)は本ファイル末尾の「検証記録」に記録する
- scss は移動しない。既存の `src/styles/components/<game>/*.module.scss` を新コンポーネントから import する
- 既存のゲーム別コンポーネントは `git mv` で `features/<game>/components/` へ移動(履歴維持)。2ゲーム以上で使う共通品は `src/components/common/` へ
- Prettier 設定(tabWidth:4 / singleQuote / semi / trailingComma:es5)は変更しない
- 各タスク完了時に `npm test && npm run lint && npm run build` が通ること(lint は error 0、warning は既存分のみ可)
- ゲームごとの完了時に本番 Heroku 接続(`npm run dev` → 2タブ)で動作確認する
- サーバペイロードの詳細型は Stage 4(strict化)まで `any` 許容。ただし state のトップレベル形状(フィールド名と用途)は types.ts に明示する

## 実装順序

Task 1(useGameSocket 修正)→ hideout(Task 2〜4)→ decrypt(Task 5〜6)→ timebomb(Task 7〜8)→ werewolf(Task 9〜10)→ fakeartist(Task 11〜12)→ 最終検証(Task 13)

各ゲームは「① reducer + テスト + フック」→「② コンポーネント分割 + ページ薄型化」の2コミット構成。

---

### Task 1: useGameSocket の Minor 修正(Stage 2 申し送り)

**Files:**
- Modify: `src/lib/stomp/useGameSocket.ts`
- Test: `src/lib/stomp/useGameSocket.test.ts`

**Interfaces:**
- Consumes: 既存 `useGameSocket`(Stage 2 実装)
- Produces: 変更なし(内部修正のみ)。`enabled` が true→false になったとき `status` が `'disconnected'` に戻る

- [ ] **Step 1: 失敗するテストを追加**

`src/lib/stomp/useGameSocket.test.ts` の describe 内に追加:

```ts
    it('enabled が true→false になると status は disconnected に戻る', () => {
        const { result, rerender } = renderHook(
            ({ enabled }) =>
                useGameSocket({ topic: '/topic/x', onMessage: () => {}, enabled }),
            { initialProps: { enabled: true } }
        );
        act(() => MockClient.instances[0]._open());
        expect(result.current.status).toBe('connected');
        rerender({ enabled: false });
        expect(result.current.status).toBe('disconnected');
    });
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npm test`
Expected: 新規1件が FAIL(cleanup 後も status が 'connected' のまま)。既存11件は PASS。

- [ ] **Step 3: 実装**

`src/lib/stomp/useGameSocket.ts` の useEffect cleanup を修正:

```ts
        return () => {
            clientRef.current = null;
            subRef.current = null;
            client.deactivate();
            setStatus('disconnected');
        };
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npm test`
Expected: 全12件 PASS。

- [ ] **Step 5: lint・ビルド確認と Commit**

Run: `npm run lint && npm run build`

```bash
git add src/lib/stomp/
git commit -m "useGameSocketのenabled解除時にstatusをdisconnectedへ戻す"
```

---

### Task 2: hideout reducer + テスト

**Files:**
- Create: `src/features/hideout/types.ts`
- Create: `src/features/hideout/reducer.ts`
- Test: `src/features/hideout/reducer.test.ts`

**Interfaces:**
- Consumes: `SocketInfo`(`src/type`)
- Produces:
  - `HideoutState` / `HideoutAction` / `initialHideoutState`(types.ts / reducer.ts)
  - `hideoutReducer(state: HideoutState, action: HideoutAction): HideoutState`
  - Task 3 の `useHideoutRoom` がこれらを使う

- [ ] **Step 1: 型定義を作成**

`src/features/hideout/types.ts`:

```ts
import type { SocketInfo } from '../../type';

// サーバ由来フィールドの詳細型は Stage 4 で精緻化する
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HideoutUser = { userName: string; userNo: number; userIconUrl: string | null } & Record<string, any>;

export type HideoutState = {
    // room
    playerName: string | null;
    messageList: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatList: any[];
    // gamedata(サーバ由来。現行 dataSet が設定していたもの)
    userList: HideoutUser[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    memberFirldList: any[];
    rushFlg: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    firldBuilding: any | null;
    waitUserIndexList: number[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    memberCardList: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    buildingCardList: any[];
    winnerTeam: number;
    turn: number;
    // view(現行 useEffect が導出していたもの)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    viewMemberCardList: any[];
    startFlg: boolean;
    rushAreaFlg: boolean;
    swatWinFlg: boolean;
    terroristWinFlg: boolean;
};

export type HideoutAction =
    | { type: 'message'; payload: SocketInfo }
    | { type: 'roomIn'; userName: string }
    | { type: 'chatSent'; message: string }
    | { type: 'systemMessage'; text: string }
    | { type: 'dismissStart' }
    | { type: 'closeRushArea' }
    | { type: 'dismissSwatWin' }
    | { type: 'dismissTerroristWin' };
```

- [ ] **Step 2: 失敗するテストを書く**

`src/features/hideout/reducer.test.ts`:

```ts
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
```

- [ ] **Step 3: テストが失敗することを確認**

Run: `npm test`
Expected: `reducer.test.ts` が FAIL(`./reducer` 未実装)。他は PASS。

- [ ] **Step 4: reducer を実装**

`src/features/hideout/reducer.ts`:

```ts
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
```

- [ ] **Step 5: テストが通ることを確認**

Run: `npm test`
Expected: hideout reducer 11件 + 既存全件 PASS。

- [ ] **Step 6: Commit**

```bash
git add src/features/hideout/
git commit -m "hideoutの受信処理をreducer化しテストを追加"
```

---

### Task 3: hideout フック `useHideoutRoom` + ページ接続

**Files:**
- Create: `src/features/hideout/useHideoutRoom.ts`
- Modify: `src/pages/hideout/[roomId].tsx`

**Interfaces:**
- Consumes: `hideoutReducer` / `initialHideoutState`(Task 2)、`useGameSocket`(既存)
- Produces: `useHideoutRoom(roomId: string | undefined)` が返すオブジェクト:
  - `state: HideoutState` / `connected: boolean` / `status: ConnectionStatus` / `entered: boolean`
  - 操作関数: `roomIn(userName)` / `chat(message)` / `init()` / `wait(index)` / `rush(index)` / `changeIcon(iconUrl)` / `closeRushArea()` / `dismissSwatWin()` / `dismissTerroristWin()`
  - Task 4 のページ・コンポーネントがこれを使う

- [ ] **Step 1: フックを実装**

`src/features/hideout/useHideoutRoom.ts`(送信 payload は現行ページの各関数と完全一致させる):

```ts
import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useGameSocket } from '../../lib/stomp/useGameSocket';
import type { SocketInfo } from '../../type';
import { hideoutReducer, initialHideoutState } from './reducer';

export function useHideoutRoom(roomId: string | undefined) {
    const [state, dispatch] = useReducer(hideoutReducer, initialHideoutState);

    const { connected, status, send } = useGameSocket({
        topic: `/topic/${roomId}`,
        onMessage: (msg) => dispatch({ type: 'message', payload: msg }),
        enabled: !!roomId,
    });

    const conect = useCallback(
        (url: string, soketInfo: SocketInfo) => {
            try {
                send(url, soketInfo);
            } catch (e) {
                dispatch({
                    type: 'systemMessage',
                    text: '通信エラー。再度試してください',
                });
            }
        },
        [send]
    );

    // 引数名は接続状態の status と衝突しないよう statusCode とする
    const buildInfo = useCallback(
        (statusCode: number, obj: unknown): SocketInfo => ({
            status: statusCode,
            roomId: roomId as string,
            userName: state.playerName,
            message: null,
            obj,
        }),
        [roomId, state.playerName]
    );

    // --- 送信系(現行ページの roomIn / chat / init / wait / rush / changeIcon と同一 payload) ---
    const roomIn = useCallback(
        (userName: string) => {
            if (userName === '') {
                return;
            }
            dispatch({ type: 'roomIn', userName });
            conect('/app/game-roomin', {
                status: 100,
                roomId: roomId as string,
                userName,
                message: null,
                obj: null,
            });
        },
        [conect, roomId]
    );

    const chat = useCallback(
        (message: string) => {
            if (state.playerName) {
                conect('/app/game-chat', {
                    ...buildInfo(101, null),
                    message,
                });
                dispatch({ type: 'chatSent', message });
            }
        },
        [conect, buildInfo, state.playerName]
    );

    const init = useCallback(() => {
        conect('/app/hideout-init', buildInfo(300, null));
    }, [conect, buildInfo]);

    const wait = useCallback(
        (index: number) => {
            conect('/app/hideout-wait', buildInfo(400, index));
        },
        [conect, buildInfo]
    );

    const rush = useCallback(
        (index: number) => {
            conect('/app/hideout-rush', buildInfo(500, index));
        },
        [conect, buildInfo]
    );

    const changeIcon = useCallback(
        (iconUrl: string) => {
            conect('/app/game-changeIcon', buildInfo(600, iconUrl));
        },
        [conect, buildInfo]
    );

    // --- ローカルUI操作 ---
    const closeRushArea = useCallback(() => dispatch({ type: 'closeRushArea' }), []);
    const dismissSwatWin = useCallback(() => dispatch({ type: 'dismissSwatWin' }), []);
    const dismissTerroristWin = useCallback(
        () => dispatch({ type: 'dismissTerroristWin' }),
        []
    );

    // --- 副作用(現行 useEffect の写し) ---
    // スタート表示: 4秒後に自動で下ろす + 先頭へスクロール
    useEffect(() => {
        if (state.startFlg) {
            scrollTo(0, 0);
            const id = window.setTimeout(() => dispatch({ type: 'dismissStart' }), 4000);
            return () => window.clearTimeout(id);
        }
    }, [state.startFlg]);

    // ラッシュ表示: 点灯時に先頭へスクロール
    useEffect(() => {
        if (state.rushAreaFlg) {
            scrollTo(0, 0);
        }
    }, [state.rushAreaFlg]);

    // チャット欄スクロール(現行 case 101 内の DOM 操作)
    useEffect(() => {
        const messageFirld = document.getElementById('chat-firld');
        if (messageFirld) {
            messageFirld.scrollTop = messageFirld.scrollHeight;
        }
    }, [state.chatList]);

    // 入室検知 + アイコン初期設定(classList 操作は entered の導出に置換)
    const own = state.userList.filter((u) => u.userName === state.playerName)[0];
    const entered = !!own;
    const iconInitialized = useRef(false);
    useEffect(() => {
        if (own && own.userIconUrl === null && !iconInitialized.current) {
            iconInitialized.current = true;
            changeIcon('/images/icon/icon' + own.userNo + '.jpg');
        }
    }, [own, changeIcon]);

    return {
        state,
        connected,
        status,
        entered,
        roomIn,
        chat,
        init,
        wait,
        rush,
        changeIcon,
        closeRushArea,
        dismissSwatWin,
        dismissTerroristWin,
    };
}
```

- [ ] **Step 2: ページをフックに接続(UI 構造はまだ変えない)**

`src/pages/hideout/[roomId].tsx` を編集:

- 削除: `useGameSocket` 直接呼び出し、全 useState(17個)、`roomIn`/`chat`/`init`/`wait`/`rush`/`changeIcon`/`conect`/`getMessage`/`dataSet`、全 useEffect(ラッシュ・スタート・勝敗・入室・ヘッダ用)
- 追加:
  ```tsx
  const {
      state,
      connected,
      status,
      entered,
      roomIn,
      chat,
      init,
      wait,
      rush,
      changeIcon,
      closeRushArea,
      dismissSwatWin,
      dismissTerroristWin,
  } = useHideoutRoom(roomId as string | undefined);
  ```
- JSX 内の参照を置換: `messageList`→`state.messageList`、`userList`→`state.userList`、`turn`→`state.turn` など(全 state 参照に `state.` を付ける)
- `roominbtn` の div を `className={`${styles.roominbtn} ${entered ? styles.in : ''}`}` に変更(querySelector での classList.add を置換)
- `RushTurn` の `endFnc` は `closeRushArea` に、勝敗モーダルの `endFnc` 内 `setTerroristWinFlg(false)`/`setSwatWinFlg(false)` は `dismissTerroristWin`/`dismissSwatWin` に置換(setTimeout 3000 は現行どおり維持)

- [ ] **Step 3: 検証と Commit**

Run: `npm test && npm run lint && npm run build`
Expected: 全 PASS / error 0 / build 成功。

Run: `npm run dev` → 2タブで `http://localhost:3000/hideout/<createroomで取得したid>` → 入室・GAME START・待機/突入・アイコン変更・勝敗表示を確認。

```bash
git add src/features/hideout/ src/pages/hideout/
git commit -m "hideoutをuseHideoutRoomフックに接続"
```

---

### Task 4: hideout コンポーネント分割 + 共通部品

**Files:**
- Create: `src/components/common/RoomInForm.tsx`(全ゲーム共用)
- Move: `src/components/timebomb/start.tsx` → `src/components/common/Start.tsx`(全5ゲームが使用)
- Move: `src/components/hideout/*` → `src/features/hideout/components/`(6ファイル)
- Create: `src/features/hideout/components/WinnerModals.tsx`
- Modify: `src/pages/hideout/[roomId].tsx`(薄型化)
- Modify: `src/pages/{decrypt,timebomb,werewolf,fakeartist}/[roomId].tsx`(Start の import パスのみ)

**Interfaces:**
- Consumes: `useHideoutRoom`(Task 3)
- Produces:
  - `RoomInForm({ connected, entered, onRoomIn, className, enteredClassName })` — Task 6/8/10/12 でも使用
  - `Start`(`src/components/common/Start.tsx`)— 全ゲームの import 先
  - hideout ページが 100 行以下の薄い入り口になる

- [ ] **Step 1: 共通 `RoomInForm` を作成**

`src/components/common/RoomInForm.tsx`(現行5ゲームの入室フォームを共通化。非制御 input の DOM 直読みを制御された state に置換):

```tsx
import { useState } from 'react';

type Props = {
    connected: boolean;
    entered: boolean;
    onRoomIn: (userName: string) => void;
    className: string; // 各ゲームの styles.roominbtn
    enteredClassName: string; // 各ゲームの styles.in
};

export default function RoomInForm({
    connected,
    entered,
    onRoomIn,
    className,
    enteredClassName,
}: Props) {
    const [name, setName] = useState('');
    return (
        <div className={`${className} ${entered ? enteredClassName : ''}`}>
            <p>
                <label htmlFor="username">Name</label>
            </p>
            <input
                disabled={!connected}
                type="text"
                id="username"
                maxLength={20}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key == 'Enter') {
                        e.preventDefault();
                        onRoomIn(name);
                    }
                }}
            />
            <button disabled={!connected} onClick={() => onRoomIn(name)}>
                Room IN
            </button>
        </div>
    );
}
```

注: decrypt / werewolf / fakeartist の現行フォームと構造は同一(disabled の有無差は connected を渡せば無害に統一される)。timebomb のみ `turn < 1` での出し分けがページ側にあるため、ページ側の条件レンダリングで包む。

- [ ] **Step 2: `Start` を common へ移動し全ページの import を更新**

```bash
git mv src/components/timebomb/start.tsx src/components/common/Start.tsx
```

5ページ + 参照があれば他コンポーネントの `import Start from '../../components/timebomb/start';` を `import Start from '../../components/common/Start';` に置換。

Run: `grep -rn "components/timebomb/start" src`
Expected: ヒット 0 件。

- [ ] **Step 3: hideout コンポーネントを features へ移動**

```bash
git mv src/components/hideout src/features/hideout/components
```

移動6ファイル(buildcard / gameinfo / hideoutheadinfo / hideouticon / rushturn / userInfo)内の相対 import(`../../styles/...` → `../../../styles/...` 等)と、ページ側の import を修正。

- [ ] **Step 4: `WinnerModals` を切り出し**

`src/features/hideout/components/WinnerModals.tsx`(現行ページの terroristWinFlg / swatWinFlg のモーダル2ブロックをそのまま移設):

```tsx
import HideoutModal from '../../../components/modal/hideoutmodal';
import styles from '../../../styles/components/hideout/room.module.scss';

type Props = {
    rushAreaFlg: boolean;
    terroristWinFlg: boolean;
    swatWinFlg: boolean;
    dismissTerroristWin: () => void;
    dismissSwatWin: () => void;
};

export default function WinnerModals({
    rushAreaFlg,
    terroristWinFlg,
    swatWinFlg,
    dismissTerroristWin,
    dismissSwatWin,
}: Props) {
    return (
        <>
            {!rushAreaFlg && terroristWinFlg && (
                <HideoutModal
                    type={'seven'}
                    endFnc={() => {
                        setTimeout(() => {
                            dismissTerroristWin();
                        }, 3000);
                    }}
                >
                    <div className={styles.result}>
                        <img src="/images/hideout/terroristwin.png" alt="結果" />
                    </div>
                </HideoutModal>
            )}
            {!rushAreaFlg && swatWinFlg && (
                <HideoutModal
                    type={'five'}
                    endFnc={() => {
                        setTimeout(() => {
                            dismissSwatWin();
                        }, 3000);
                    }}
                >
                    <div className={styles.result}>
                        <img src="/images/hideout/swatwin.png" alt="結果" />
                    </div>
                </HideoutModal>
            )}
        </>
    );
}
```

- [ ] **Step 5: ページを薄型化**

`src/pages/hideout/[roomId].tsx` を「Head/style + フック呼び出し + コンポーネント組み立て」だけにする(目安100行以下)。入室フォームは `<RoomInForm connected={connected} entered={entered} onRoomIn={roomIn} className={styles.roominbtn} enteredClassName={styles.in} />`、勝敗モーダルは `<WinnerModals ... />`。HOME/GAME START ボタン・RULE ボタン・Socialbtn は行数が小さいためページ直書きのまま可。

- [ ] **Step 6: 検証と Commit**

Run: `npm test && npm run lint && npm run build`
Run: `npm run dev` → hideout を2タブで再確認(入室フォームの Enter 入室含む)+ 他4ゲームの Start 表示(GAME START 演出)を1ゲームずつ目視。

```bash
git add -A src/
git commit -m "hideoutをfeature構造に分割しページを薄型化"
```

---

## ゲーム共通レシピ(Task 5〜12 で参照)

hideout(Task 2〜4)で確立した型を他ゲームに適用する。各ゲームで共通する作業は以下のとおり。**ゲーム固有の state・status 分岐・副作用は各タスクに全て明記してあり、そちらが正**。

1. `src/features/<game>/types.ts` — State / Action 型(各タスクに全文)
2. `src/features/<game>/reducer.ts` — `initial<Game>State` + `<game>Reducer`。構成は hideoutReducer と同じ2層(`onMessage` で status 分岐、外側でローカルアクション)。`dataSet` 相当は各タスクの対応表どおりに写す
3. `src/features/<game>/reducer.test.ts` — 各タスクのテスト表の全ケース。テストの書き方(`msg()` / `serverObj()` ヘルパー、describe 構成)は Task 2 Step 2 と同形式
4. `src/features/<game>/use<Game>Room.ts` — 構成は `useHideoutRoom`(Task 3 Step 1)と同じ:
   - `useReducer` + `useGameSocket`(topic はゲーム別)
   - `conect(url, soketInfo)`: try/catch で失敗時 `systemMessage` dispatch
   - 送信系関数: **現行ページの関数から destination / payload を一字一句移す**(各タスクに一覧)
   - 副作用 useEffect: 各タスクの「副作用」表どおり
   - 共通で返すもの: `state` / `connected` / `status` / `entered`(userList に playerName がいるか)/ 送信系関数 / ローカルアクション関数
   - アイコン初期設定 effect(hideout Step 1 の `iconInitialized` パターン)は decrypt / werewolf / fakeartist にもある(timebomb には無い)
5. ページ接続(①のコミット): useState / getMessage / dataSet / useEffect / 送信関数を全削除し、フックの返り値で JSX の参照を置換。`roominbtn` の classList 操作は `entered` による className 導出に置換
6. 分割(②のコミット): `git mv src/components/<game> src/features/<game>/components` + import 修正、入室フォームを共通 `RoomInForm` に置換、ページを100行以下に

各ゲームの検証: `npm test && npm run lint && npm run build` → `npm run dev` で本番接続2タブ確認 → 2コミット。

---

### Task 5: decrypt reducer + テスト + フック

**Files:**
- Create: `src/features/decrypt/types.ts`
- Create: `src/features/decrypt/reducer.ts`
- Create: `src/features/decrypt/useDecryptRoom.ts`
- Test: `src/features/decrypt/reducer.test.ts`
- Modify: `src/pages/decrypt/[roomId].tsx`(フック接続)

**Interfaces:**
- Consumes: `SocketInfo`、`useGameSocket`、`RoomInForm` はまだ使わない(Task 6)
- Produces: `useDecryptRoom(roomId)` → `{ state, connected, status, entered, roomIn, chat, changeIcon, resetCode, resetTeam, choiceTeam, modeChange, init, handupCreatecode, createCodeword, decryptCode, changeLimitTime, limittimeDone }`

- [ ] **Step 1: 型定義**

`src/features/decrypt/types.ts`:

```ts
import type { SocketInfo } from '../../type';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DecryptUser = { userName: string; userNo: number; userIconUrl: string | null } & Record<string, any>;

export type DecryptState = {
    playerName: string | null;
    // playerData: userList 内の自分。見つかった時のみ更新(現行 useEffect と同じ keep-last)
    playerData: DecryptUser | null;
    messageList: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatList: any[];
    // gamedata(現行 dataSet の7フィールド)
    userList: DecryptUser[];
    gameTime: number;
    turn: number;
    choiceMode: number;
    winnerTeam: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    leftTeam: any | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rightTeam: any | null;
    // view
    startFlg: boolean;
};

export type DecryptAction =
    | { type: 'message'; payload: SocketInfo }
    | { type: 'roomIn'; userName: string }
    | { type: 'chatSent'; message: string }
    | { type: 'systemMessage'; text: string }
    | { type: 'dismissStart' };
```

- [ ] **Step 2: 失敗するテストを書く**

Task 2 Step 2 と同形式(`msg()` / `serverObj()` ヘルパー)。`serverObj` は dataSet の7フィールド(`userList` / `turn` / `gameTime` / `choiceMode` / `winnerTeam` / `leftTeam` / `rightTeam`)。テストケース(各1 it):

| # | ケース | 入力 | 期待 |
|---|---|---|---|
| 1 | dataSet 系 status | 100 / 110 / 120 / 130 / 140 / 350 / 370 / 500 それぞれで `msg(st, serverObj({ turn: 2 }))` | 7フィールドが反映される(ループで8статус全部回す) |
| 2 | チャット | 101, obj=`[{text:'hi'}]` | `chatList` のみ更新 |
| 3 | 再入室 | 200, `serverObj()`, message='再入室' | dataSet 反映 + `messageList` 末尾に '再入室' |
| 4 | 開始 | 300, `serverObj()` | `startFlg === true` + dataSet 反映 |
| 5 | 例外 | 404, message='err' | `messageList` 末尾 'err'、他は不変 |
| 6 | アイコン | 650, obj=userList | `userList` のみ更新 |
| 7 | 個人エラー(自分宛) | playerName='me' の state に 998, userName='me', message='本人' | `messageList` に追記 |
| 8 | 個人エラー(他人宛) | 同上で userName='other' | state 不変 |
| 9 | 全員エラー | 999, message='all' | `messageList` に追記 |
| 10 | playerData 導出 | playerName='me' の state に 100, userList=[me含む] | `playerData.userName === 'me'`。me がいない userList を後続で受けても playerData は据え置き |
| 11 | 未知 status | 777 | `s` が同一参照(不変) |
| 12 | ローカル | roomIn / chatSent / systemMessage / dismissStart | Task 2 と同旨 |

Run: `npm test` → Expected: decrypt の新規テストが FAIL(reducer 未実装)。

- [ ] **Step 3: reducer を実装**

`src/features/decrypt/reducer.ts` の `onMessage` 分岐(現行 getMessage L268-339 の写し):

```ts
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
```

`dataSet` は7フィールドを反映 + playerData 導出(`userList.find` で自分がいれば更新、いなければ据え置き)。ローカルアクション分岐は hideout と同旨(dismissStart のみ)。

- [ ] **Step 4: テスト PASS を確認 → フック実装 → ページ接続**

`useDecryptRoom.ts`: topic `` `/topic/${roomId}` ``。送信系(現行ページから payload を一字一句移す):

| 関数 | destination | status | obj | 備考 |
|---|---|---|---|---|
| roomIn(userName) | /app/game-roomin | 100 | null | 送信前に `dispatch roomIn` |
| chat(message) | /app/game-chat | 101 | null | `playerData` がある時のみ。送信後 chatSent |
| resetCode() | /app/decrypt-resetcode | 110 | null | |
| resetTeam() | /app/decrypt-resetteam | 120 | null | |
| choiceTeam(teamNo) | /app/decrypt-choiceteam | 130 | teamNo | |
| modeChange(modeNo) | /app/decrypt-modechange | 140 | modeNo | |
| init() | /app/decrypt-init | 300 | null | |
| handupCreatecode() | /app/decrypt-handupcreatecode | 350 | null | |
| createCodeword(wordList) | /app/decrypt-createcodeword | 370 | wordList | |
| decryptCode(noList) | /app/decrypt-decryptcode | 500 | noList | |
| changeLimitTime(time) | /app/game-setlimittime | 550 | time | userName: null |
| limittimeDone() | /app/game-dooverLimit | 600 | turn | `state.turn === 2` の時のみ。userName: null |

副作用(useEffect):

| 現行 | 移行後 |
|---|---|
| startFlg → scrollTo + 4秒後解除 | `state.startFlg` 監視 → scrollTo + setTimeout(dismissStart, 4000) |
| case 101 の chat-firld scrollTop | `state.chatList` 監視(hideout と同一コード) |
| 入室時 classList + アイコン初期設定 | `entered` 導出 + iconInitialized パターン(hideout と同一) |
| winnerTeam 監視(処理なし) | 削除(元コードが空) |

ページ接続は共通レシピ 5(useState 12個・getMessage・dataSet・useEffect 4本・送信関数を削除)。decrypt の入室フォームには現行 `disabled` が無いが、`RoomInForm` 化(Task 6)で connected 連動になる(挙動差分として記録)。

- [ ] **Step 5: 検証と Commit**

Run: `npm test && npm run lint && npm run build`
Run: `npm run dev` → 2タブで decrypt: 入室 → チーム選択 → GAME START → 暗号作成 → 解読 → 制限時間変更。

```bash
git add src/features/decrypt/ src/pages/decrypt/
git commit -m "decryptの受信処理をreducer化しフックに接続"
```

---

### Task 6: decrypt コンポーネント分割

**Files:**
- Move: `src/components/decrypt/*` → `src/features/decrypt/components/`(teamDataInfo / userDataInfo)
- Modify: `src/pages/decrypt/[roomId].tsx`(薄型化 + RoomInForm 置換)

**Interfaces:**
- Consumes: `useDecryptRoom`(Task 5)、`RoomInForm`(Task 4)

- [ ] **Step 1: git mv + import 修正**

```bash
git mv src/components/decrypt src/features/decrypt/components
```

- [ ] **Step 2: 入室フォームを `RoomInForm` に置換しページ薄型化**

`<RoomInForm connected={connected} entered={entered} onRoomIn={roomIn} className={styles.roominbtn} enteredClassName={styles.in} />`。decrypt は元々インライン UI が少ない(TeamDataInfo に集約済み)ため、フォーム置換 + import 整理で100行以下になる見込み。超える場合は btnarea(HOME/GAME START)を `features/decrypt/components/GameButtons.tsx` に切り出す。

- [ ] **Step 3: 検証と Commit**

Run: `npm test && npm run lint && npm run build` → `npm run dev` で decrypt 再確認。

```bash
git add -A src/
git commit -m "decryptをfeature構造に分割しページを薄型化"
```

---

### Task 7: timebomb reducer + テスト + フック

timebomb は他ゲームと受信形式が異なる: **status を持つ SocketInfo 形式と、room オブジェクト直渡し形式の2系統**が同じ topic に流れる(現行 `receve` L111-175)。

**Files:**
- Create: `src/features/timebomb/types.ts`
- Create: `src/features/timebomb/reducer.ts`
- Create: `src/features/timebomb/useTimebombRoom.ts`
- Test: `src/features/timebomb/reducer.test.ts`
- Modify: `src/pages/timebomb/[roomId].tsx`(フック接続)

**Interfaces:**
- Consumes: `SocketInfo` / `RoomUserInfo` / `TimeBombUser` / `LeadCards`(`src/type`)
- Produces: `useTimebombRoom(roomId)` → `{ state, connected, status, entered, roomIn, start, play, changeIcon, limittimeDone, changeLimitTme, changeSecretFlg }`

- [ ] **Step 1: 型定義**

`src/features/timebomb/types.ts`:

```ts
export type TimebombState = {
    playerName: string; // 初期値 ''(他ゲームと異なり null でない)
    messageList: string[];
    // gamedata
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    timeBombUserList: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    leadCardsList: any[];
    round: number;
    turn: number;
    releaseNo: number;
    limitTime: number;
    secretFlg: boolean;
    // view
    startFlg: boolean;
    roundMessageFlg: boolean;
    endFlg: boolean;
    bommerFlg: boolean;
    policeFlg: boolean;
};

export type TimebombAction =
    // 受信は2系統あるため payload は any(status 有無を reducer 内で判定)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | { type: 'message'; payload: any }
    | { type: 'roomIn'; userName: string }
    | { type: 'systemMessage'; text: string }
    | { type: 'dismissStart' }
    | { type: 'dismissRoundMessage' };
```

- [ ] **Step 2: 失敗するテストを書く**

`serverRoom()` ヘルパー(room オブジェクト形式): `userList` / `turn` / `releaseNo` / `limitTime` / `secretFlg` / `leadCardsList` / `round` / `winnerTeam`。テストケース:

| # | ケース | 入力 | 期待 |
|---|---|---|---|
| 1 | status 200 | msg(200, serverRoom(), message='入室') | messageList に '入室' + room 反映 |
| 2 | status 201 | msg(201, obj=userList) | timeBombUserList のみ更新 |
| 3 | status 404 | msg(404, message='err') | messageList のみ追記 |
| 4 | status 800 | msg(800, obj=true) | secretFlg === true |
| 5 | status 900 | msg(900, obj=300) | limitTime === 300 |
| 6 | status その他(例 555) | msg(555, message='other') | messageList に追記(現行 default) |
| 7 | room直渡し: データ反映 | serverRoom({ turn: 3 }) | 6フィールド反映 + endFlg === false |
| 8 | 解除成功 | releaseNo=1 の state に serverRoom({ releaseNo: 2 }) | messageList 末尾 '解除に成功' |
| 9 | 開始(turn===1) | bommerFlg/policeFlg=true の state に serverRoom({ turn: 1 }) | startFlg true / bommer・police false |
| 10 | 警察勝利 | serverRoom({ winnerTeam: 1 }) | policeFlg true / endFlg true |
| 11 | 爆弾勝利 | serverRoom({ winnerTeam: 2 }) | bommerFlg true / endFlg true |
| 12 | ラウンド進行 | round=1 の state に serverRoom({ round: 2, winnerTeam: 0 }) | round 2 / roundMessageFlg true |
| 13 | ラウンド1は演出なし | round=0 の state に serverRoom({ round: 1 }) | round 1 / roundMessageFlg false |
| 14 | leadCardsList 無し | serverRoom() から leadCardsList を削除 | 既存 leadCardsList 据え置き |
| 15 | ローカル | roomIn / systemMessage / dismissStart / dismissRoundMessage | 各フィールド更新 |

- [ ] **Step 3: reducer を実装**

`onMessage`(現行 receve + setData の写し。**順序に注意**: 解除判定 → setData → 開始判定 → 勝敗判定):

```ts
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
```

- [ ] **Step 4: フック実装 → ページ接続**

`useTimebombRoom.ts`: topic **`` `/topic/${roomId}/timebomb` ``**。送信系:

| 関数 | destination | payload | 備考 |
|---|---|---|---|
| roomIn(msg: RoomUserInfo) | /app/roomin | msg そのまま | 送信前に `dispatch roomIn(msg.userName)` |
| start(msg: RoomUserInfo) | /app/start | msg そのまま | |
| play(cardIndex) | /app/play | RoomUserInfo(action:'play') | |
| changeIcon(iconUrl) | /app/changeIcon | RoomUserInfo(action:iconUrl) | |
| limittimeDone(pturn) | /app/timebomb-limittime | SocketInfo(status:600, obj:pturn) | 自分が turnFlg の時のみ。try/catch は握りつぶし(現行維持) |
| changeLimitTme(time) | /app/timebomb-setlimittime | SocketInfo(status:900, obj:time) | try/catch 無し(現行維持) |
| changeSecretFlg() | /app/timebomb-changesecret | SocketInfo(status:800, obj:null) | try/catch 無し(現行維持) |

副作用(useEffect):

| 現行 | 移行後 |
|---|---|
| startFlg → 4秒後解除 | `state.startFlg` 監視 → setTimeout(dismissStart, 4000) |
| roundMessageFlg → 5秒後 body.classList.remove('modal_active') + 解除 | `state.roundMessageFlg` 監視 → setTimeout(() => { document.body.classList.remove('modal_active'); dispatch dismissRoundMessage; }, 5000) |
| turn===1 時の body.classList.remove + scrollTo | `state.startFlg` の立ち上がり監視 → body.classList.remove('modal_active') + scrollTo(0, 0) |
| 勝敗時 scrollTo | `state.policeFlg || state.bommerFlg` の立ち上がり監視 → scrollTo(0, 0) |
| 入室時 roominbtn classList | `entered` 導出(timebomb はアイコン初期設定なし) |

ページ接続: useState 14個・receve・setData・useEffect 2本・送信関数を削除し `useTimebombRoom` に置換。

- [ ] **Step 5: 検証と Commit**

Run: `npm test && npm run lint && npm run build`
Run: `npm run dev` → 2タブで timebomb: 入室 → GAME START → カード公開 → ラウンド進行演出 → 制限時間ラジオ・SECRET MODE 同期 → 勝敗表示。

```bash
git add src/features/timebomb/ src/pages/timebomb/
git commit -m "timebombの受信処理をreducer化しフックに接続"
```

---

### Task 8: timebomb コンポーネント分割

**Files:**
- Move: `src/components/timebomb/{headInfo,userInfo}.tsx` → `src/features/timebomb/components/`(start.tsx は Task 4 で common へ移動済み)
- Create: `src/features/timebomb/components/LimitTimeSelector.tsx`(制限時間ラジオ4択ブロック L507-573)
- Create: `src/features/timebomb/components/SecretModeCheckbox.tsx`(SECRET MODE ブロック L575-595)
- Create: `src/features/timebomb/components/ResultModals.tsx`(bommer/police モーダル + roundMessage モーダル L318-343)
- Create: `src/features/timebomb/components/ReleaseLights.tsx`(ライト表示 L438-464)
- Modify: `src/pages/timebomb/[roomId].tsx`(薄型化 + RoomInForm)

**Interfaces:**
- Consumes: `useTimebombRoom`(Task 7)、`RoomInForm`(Task 4)
- Produces: 上記4コンポーネント(props は現行 JSX が参照している state / 関数をそのまま渡す。例: `LimitTimeSelector({ limitTime, onChange })` で onChange=`changeLimitTme`)

- [ ] **Step 1: git mv + 上記コンポーネント切り出し**

現行 JSX をそのまま props 参照に書き換えて移設する(ロジック変更なし)。timebomb の入室フォームは `turn < 1` 条件でページ側が包む:

```tsx
{state.turn < 1 && (
    <RoomInForm
        connected={connected}
        entered={entered}
        onRoomIn={(name) => {
            if (name === '') {
                return;
            }
            roomIn({
                action: 'roomIn',
                roomId: roomId as string,
                userName: name,
                cardIndex: 0,
                winTeam: 0,
            });
        }}
        className={styles.roominbtn}
        enteredClassName={styles.in}
    />
)}
```

デバッグ用の `false && (...)` 入室ブロック(L411-436)は削除する(到達不能コード。挙動差分として記録)。

- [ ] **Step 2: 検証と Commit**

Run: `npm test && npm run lint && npm run build` → `npm run dev` で timebomb 再確認。

```bash
git add -A src/
git commit -m "timebombをfeature構造に分割しページを薄型化"
```

---

### Task 9: werewolf reducer + テスト + フック

werewolf 固有の論点が2つ: **(a) 役職カスタマイズのカウンター**が DOM 直接操作(`#cunter_N` の textContent 読み書き。`setRollCustum`/`cunter`/`setRoll` L33-68, L162-186)→ state `counterMap` に置換。**(b) 銃声 Audio と カットイン**(case 500)→ reducer は `cutInNo` と連番 `snipeSeq` を更新し、再生は effect。

**Files:**
- Create: `src/features/werewolf/types.ts`
- Create: `src/features/werewolf/reducer.ts`
- Create: `src/features/werewolf/useWerewolfRoom.ts`
- Test: `src/features/werewolf/reducer.test.ts`
- Modify: `src/pages/werewolf/[roomId].tsx`(フック接続)

**Interfaces:**
- Consumes: `SocketInfo`、`WerewolfRoll` / `WerewolfUser`(`src/type/werewolf`)
- Produces: `useWerewolfRoom(roomId)` → `{ state, connected, status, entered, roomIn, chat, changeIcon, setRoll, setRollSet, init, selectRoll, userAction, changeLimitTime, limittimeDone, voting, counter, setModalRoll, setModalOwnFlg, setRuleFlg, setResultFlg }`

- [ ] **Step 1: 型定義**

`src/features/werewolf/types.ts`:

```ts
import type { SocketInfo } from '../../type';
import type { WerewolfRoll, WerewolfUser } from '../../type/werewolf';

export type WerewolfState = {
    playerName: string | null;
    playerData: WerewolfUser | null; // keep-last(見つかった時のみ更新)
    messageList: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatList: any[];
    // gamedata(現行 dataSet の6フィールド)
    userList: WerewolfUser[];
    turn: number;
    winteamList: number[];
    staticRollList: WerewolfRoll[];
    rollList: WerewolfRoll[];
    npcuser: WerewolfUser | null;
    // gamedata(dataSet 外で受信)
    limitTime: number;
    rollInfoList: WerewolfRoll[];
    // 役職カスタマイズ(旧 #cunter_N DOM。rollNo → 人数)
    counterMap: Record<number, number>;
    // view
    startFlg: boolean;
    modalRoll: WerewolfRoll | null;
    modalOwnFlg: boolean;
    rollSelectTurnFlg: boolean;
    votingStartFlg: boolean;
    cutInNo: number;
    snipeSeq: number; // 銃声再生トリガ(独裁者/暗殺者アクションごとに +1)
    resultFlg: boolean;
    ruleFlg: boolean;
    winMessage: string | null;
};

export type WerewolfAction =
    | { type: 'message'; payload: SocketInfo }
    | { type: 'roomIn'; userName: string }
    | { type: 'chatSent'; message: string }
    | { type: 'systemMessage'; text: string }
    | { type: 'dismissStart' }
    | { type: 'counter'; rollNo: number; delta: 1 | -1 } // 0〜15 でクランプ
    | { type: 'setModalRoll'; roll: WerewolfRoll | null }
    | { type: 'setModalOwnFlg'; value: boolean }
    | { type: 'setRuleFlg'; value: boolean }
    | { type: 'setResultFlg'; value: boolean }
    | { type: 'setRollSelectTurnFlg'; value: boolean }
    | { type: 'setVotingStartFlg'; value: boolean }
    | { type: 'clearCutIn' }
    | { type: 'setWinMessage'; message: string | null };
```

- [ ] **Step 2: 失敗するテストを書く**

`serverObj()` は dataSet の6フィールド + `limitTime` / `rollNoList` / `rollList`。テストケース:

| # | ケース | 入力 | 期待 |
|---|---|---|---|
| 1 | 入室系 | 100 / 200 で serverObj({ limitTime: 180, rollNoList: [1,1,2] }) | dataSet 6フィールド + limitTime=180 + rollInfoList + counterMap={1:2, 2:1} |
| 2 | 役職設定 | 150 | dataSet + counterMap + rollInfoList(limitTime は据え置き) |
| 3 | チャット | 101 | chatList のみ |
| 4 | 開始 | ruleFlg/resultFlg=true の state に 300 | startFlg true / ruleFlg・resultFlg false / dataSet |
| 5 | 役職選択 | 400 | dataSet のみ |
| 6 | 例外 | 404 | messageList 追記 |
| 7 | 独裁者アクション | 500, message='0', userList[0].roll.rollNo=6 | cutInNo=6 / snipeSeq が +1 |
| 8 | 暗殺者アクション | 500, rollNo=10 | cutInNo=10 / snipeSeq +1 |
| 9 | 占い師(本人) | 500, rollNo=8, actionUser.userName===playerName | cutInNo=8 / snipeSeq 不変 |
| 10 | 占い師(他人) | 500, rollNo=8, 他人 | cutInNo 不変 |
| 11 | 怪盗(本人) | 500, actionUser.lastMessage='怪盗した。', 本人 | cutInNo=11 |
| 12 | 制限時間 | 550, obj=300 | limitTime のみ |
| 13 | ターン変更 | 600 | dataSet のみ |
| 14 | アイコン | 650 | userList のみ |
| 15 | 投票 | 700, serverObj({ rollNoList: [3] }) | dataSet + counterMap={3:1} |
| 16 | 個人/全員エラー | 998(本人・他人)/ 999 | decrypt と同旨 |
| 17 | counter ローカル | {type:'counter', rollNo:1, delta:1} ×16回 | counterMap[1] は 15 で止まる。delta:-1 で 0 未満にならない |
| 18 | playerData keep-last | decrypt #10 と同旨 | |
| 19 | 未知 status / ローカル各種 | | 同旨 |

- [ ] **Step 3: reducer を実装**

ポイント(現行 getMessage L327-462 の写し):

```ts
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
```

- 100 / 200: `dataSet` + `limitTime: obj.limitTime` + `counterMap: toCounterMap(obj.rollNoList)` + `rollInfoList: obj.rollList`
- 150: dataSet + counterMap + rollInfoList(limitTime なし)
- 300: `{ ...state, startFlg: true, ruleFlg: false, resultFlg: false }` に dataSet
- 500: dataSet 後、`actionUser = obj.userList[Number(socketInfo.message)]` を判定:
  - `lastMessage === '怪盗した。'` かつ本人 → cutInNo 11(break 相当で終了)
  - rollNo 6 → cutInNo 6 + `snipeSeq: state.snipeSeq + 1`
  - rollNo 8 / 9 → 本人のみ cutInNo 8 / 9
  - rollNo 10 → cutInNo 10 + snipeSeq +1
- 700: dataSet + counterMap
- `counter` ローカルアクション: `Math.max(0, Math.min(15, current + delta))`
- dataSet 内で playerData 導出(keep-last)

- [ ] **Step 4: フック実装 → ページ接続**

topic `` `/topic/${roomId}` ``。送信系(payload は現行どおり):

| 関数 | destination | status | obj |
|---|---|---|---|
| roomIn(userName) | /app/game-roomin | 100 | null |
| chat(message) | /app/game-chat | 101 | null |
| setRoll() | /app/werewolf-setrollregulation | 150 | **state.counterMap から生成**: staticRollList の各 rollNo を counterMap[rollNo] 個ずつ push した intList(旧 DOM 読み取りの置換) |
| setRollSet(rollNoList) | /app/werewolf-setrollregulation | 150 | rollNoList |
| init() | /app/werewolf-init | 300 | null |
| selectRoll(rollIndex) | /app/werewolf-selectroll | 400 | rollIndex |
| userAction(target) | turn===2 → discussionAction(500, [playerName, target] を /app/werewolf-discussionaction)、turn===3 → voting | |
| changeLimitTime(time) | /app/game-setlimittime | 550 | time(userName: null) |
| limittimeDone() | /app/game-dooverLimit | 600 | turn(turn===2 のみ、userName: null) |
| voting(target) | /app/werewolf-voting | 700 | targetUsername |

副作用(useEffect。現行 L474-607 の写し):

| 現行 | 移行後 |
|---|---|
| startFlg → scrollTo + 4秒後解除 | dismissStart パターン |
| votingStartFlg → 4秒後解除 | setTimeout → dispatch setVotingStartFlg(false) |
| winteamList 監視(勝者名を3秒後に表示) | `state.winteamList.length` 監視: 0 なら setWinMessage(null)、あれば message 算出(1:人狼陣営/2:村人陣営/3:てるてる)→ setTimeout 3000 → scrollTo + dispatch setWinMessage |
| 入室時 classList + アイコン初期設定 | entered + iconInitialized パターン |
| playerData 設定 | reducer 内 keep-last に移行(effect 削除) |
| playerActionName / playerNPCActionName 導出 | **useMemo に置換**(playerData と turn からの純粋導出。L549-576 のロジックをそのまま関数化) |
| 役職選択表示制御(turn 1→表示、2で4秒後に非表示) | `state.turn` 監視 → dispatch setRollSelectTurnFlg(現行ロジック維持) |
| 投票メッセージ(turn===3) | `state.turn` 監視 → dispatch setVotingStartFlg |
| カットイン 4秒後解除 | `state.cutInNo` 監視 → setTimeout → dispatch clearCutIn |
| **銃声再生** | `state.snipeSeq` 監視(0 は無視)→ `new Audio('/se/snip.mp3').play()` |
| case 101 chat-firld scrollTop | chatList 監視(共通) |

ページ接続: useState 21個・getMessage・dataSet・useEffect 9本・モジュールスコープの `setRollCustum`/`cunter` 関数を削除。役職カスタマイズのカウンター表示 `<div id={'cunter_' + element.rollNo}>0</div>` は `{state.counterMap[element.rollNo] || 0}` に、± ボタンは `dispatch counter` を呼ぶ `counter(rollNo, delta)` に置換。

- [ ] **Step 5: 検証と Commit**

Run: `npm test && npm run lint && npm run build`
Run: `npm run dev` → 2タブで werewolf: 入室 → 役職カスタマイズ(±が他タブに反映されないこと=ローカル、設定ボタンで同期)→ GAME START → 役職選択 → 議論アクション(カットイン・銃声)→ 投票 → 勝敗表示。

```bash
git add src/features/werewolf/ src/pages/werewolf/
git commit -m "werewolfの受信処理をreducer化しフックに接続"
```

---

### Task 10: werewolf コンポーネント分割

**Files:**
- Move: `src/components/werewolf/countdown.tsx` → `src/components/common/Countdown.tsx`(fakeartist も使用)
- Move: `src/components/werewolf/*`(残り9ファイル)→ `src/features/werewolf/components/`
- Create: `src/features/werewolf/components/RollCustomize.tsx`(役職カスタマイズブロック L814-869)
- Create: `src/features/werewolf/components/LimitTimeSelector.tsx`(制限時間ブロック L871-954)
- Create: `src/features/werewolf/components/TurnMessage.tsx`(選択中/議論中/投票中のメッセージエリア L685-709)
- Modify: `src/pages/werewolf/[roomId].tsx`(薄型化 + RoomInForm)
- Modify: `src/pages/fakeartist/[roomId].tsx`(Countdown の import パスのみ)

**Interfaces:**
- Consumes: `useWerewolfRoom`(Task 9)、`RoomInForm`
- Produces: `RollCustomize({ staticRollList, counterMap, counter, setRoll, setModalRoll, setModalOwnFlg, turn })` 等。werewolf ページが100行前後の入り口になる(werewolf は組み立てが多いため 150 行まで許容。超える場合はモーダル群を `Overlays.tsx` にまとめる)

- [ ] **Step 1: git mv(countdown → common、残り → features)+ import 修正**

```bash
git mv src/components/werewolf/countdown.tsx src/components/common/Countdown.tsx
git mv src/components/werewolf src/features/werewolf/components
```

fakeartist ページの `import Countdown from '../../components/werewolf/countdown';` を common へ変更。

Run: `grep -rn "components/werewolf" src`
Expected: ヒット 0 件。

- [ ] **Step 2: 上記コンポーネント切り出し + ページ薄型化 + RoomInForm 置換**

- [ ] **Step 3: 検証と Commit**

Run: `npm test && npm run lint && npm run build` → `npm run dev` で werewolf 再確認 + fakeartist の議論カウントダウン表示確認。

```bash
git add -A src/
git commit -m "werewolfをfeature構造に分割しページを薄型化"
```

---

### Task 11: fakeartist reducer + テスト + フック

fakeartist 固有の論点: **canvas 描画は React の外**(`#draw-area` への 2D コンテキスト操作。L35-118)。reducer は「何をいつ描くか」を**連番(seq)+ データ**で state に記録し、実際の描画はフックの useEffect が行う。

**Files:**
- Create: `src/features/fakeartist/types.ts`
- Create: `src/features/fakeartist/reducer.ts`
- Create: `src/features/fakeartist/canvasDraw.ts`(現行 L29-118 の `sleep` 以外: `callBackDraw` / `clear` / `drawCanvas` / `drawPersonCanvas` をそのまま移設)
- Create: `src/features/fakeartist/useFakeartistRoom.ts`
- Test: `src/features/fakeartist/reducer.test.ts`
- Modify: `src/pages/fakeartist/[roomId].tsx`(フック接続)

**Interfaces:**
- Consumes: `SocketInfo`、`ArtDataStroke` / `FakeArtistUser`(`src/type/fakeartist`)
- Produces: `useFakeartistRoom(roomId)` → `{ state, connected, status, entered, roomIn, roomRemove, changeRadio, changeIcon, chat, init, draw, vote, changeLimitTime, limittimeDone, personCanpasMouseDown, personCanpasMouseUp }`

- [ ] **Step 1: 型定義**

`src/features/fakeartist/types.ts`:

```ts
import type { SocketInfo } from '../../type';
import type { ArtDataStroke, FakeArtistUser } from '../../type/fakeartist';

export type FakeartistState = {
    playerName: string | null;
    playerData: FakeArtistUser | null; // keep-last。ただし status 150(自分の退出)で null に戻る
    messageList: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatList: any[];
    // gamedata(現行 dataSet の7フィールド)
    userList: FakeArtistUser[];
    turn: number;
    gameTime: number;
    theme: string;
    endMessage: string;
    patternList: number[];
    limitTime: number;
    // canvas 連携
    artDataStrokeList: ArtDataStroke[];
    remoteStroke: ArtDataStroke | null; // 他人の最新ストローク
    remoteStrokeSeq: number; // remoteStroke を描くトリガ(+1 ごとに1回描画)
    redrawSeq: number; // 全ストローク再描画トリガ(自分の入室/再入室時)
    clearSeq: number; // 全消去トリガ(ゲーム開始時)
    resultSeq: number; // 投票完了(gameTime 4 到達)トリガ。モバイル時の endFlg 遅延表示に使う
    // view
    startFlg: boolean;
    disscuttionStartFlg: boolean;
    votingStartFlg: boolean;
    personCanvasZindex: number; // -1 or 1
    endFlg: boolean;
};

export type FakeartistAction =
    | { type: 'message'; payload: SocketInfo }
    | { type: 'roomIn'; userName: string }
    | { type: 'chatSent'; message: string }
    | { type: 'systemMessage'; text: string }
    | { type: 'dismissStart' }
    | { type: 'dismissDisscuttionStart' }
    | { type: 'dismissVotingStart' }
    | { type: 'showEnd' }
    | { type: 'dismissEnd' }
    | { type: 'setPersonCanvasZindex'; value: number };
```

- [ ] **Step 2: 失敗するテストを書く**

`serverObj()` は dataSet の7フィールド(userList / turn / gameTime / theme / endMessage / patternList / limitTime)。テストケース:

| # | ケース | 入力 | 期待 |
|---|---|---|---|
| 1 | 入室(自分) | playerName='me' の state に 100, userName='me', obj=serverObj({ artDataStrokeList: [stroke] }) | dataSet 反映 + redrawSeq +1 + artDataStrokeList 反映 |
| 2 | 入室(他人) | 100, userName='other' | dataSet 反映のみ(redrawSeq 不変) |
| 3 | チャット | 101 | chatList のみ |
| 4 | 退出(自分) | playerData あり state に 150, userName='me' | dataSet + playerData null |
| 5 | 退出(他人) | 150, userName='other' | dataSet のみ(playerData 維持) |
| 6 | テーマ変更 | 160, obj={ patternList: [1,3] } | patternList のみ |
| 7 | 再入室 | 200, userName='me', message='再入室' | dataSet + messageList 追記 + redrawSeq +1 |
| 8 | 開始 | 各 view フラグ true の state に 300 | startFlg true / clearSeq +1 / personCanvasZindex -1 / disscuttion・voting・endFlg false / dataSet |
| 9 | 例外 | 404 | messageList 追記 |
| 10 | お絵描き(他人) | 450, userName='other', obj.artDataStrokeList=[s1, s2](s2.endFlg=false) | remoteStroke===s2 / remoteStrokeSeq +1 / dataSet されない |
| 11 | お絵描き(自分) | 450, userName='me' | remoteStrokeSeq 不変 |
| 12 | お絵描き(endFlg 付き) | 450, 末尾 stroke.endFlg=true | dataSet 反映 + artDataStrokeList 更新 |
| 13 | 450 の両立 | 他人 + endFlg | remoteStrokeSeq +1 かつ dataSet |
| 14 | 描き中 | 451 | state 不変 |
| 15 | 投票 | 500, serverObj({ gameTime: 4 }) | dataSet + resultSeq +1 |
| 16 | 投票(継続中) | 500, serverObj({ gameTime: 3 }) | dataSet のみ(resultSeq 不変) |
| 17 | 制限時間 / 超過 | 550 → limitTime のみ、600 → dataSet | |
| 18 | アイコン | 650 | userList のみ |
| 19 | エラー系 | 998(本人/他人)/ 999 | decrypt と同旨 |
| 20 | gameTime 演出 | dataSet で gameTime 1→2 | disscuttionStartFlg true(現行「ゲーム監視」effect の写し。変化ガード付き)。2→3 で votingStartFlg true |
| 21 | 未知 status / ローカル各種 | | 同旨 |

- [ ] **Step 3: reducer を実装**

ポイント(現行 getMessage L348-478 + dataSet + ゲーム監視 effect L492-498 の写し):

- `dataSet` は7フィールド + playerData keep-last + gameTime 変化ガード:
  ```ts
  if (obj.gameTime === 2 && state.gameTime !== 2) {
      next.disscuttionStartFlg = true;
  } else if (obj.gameTime === 3 && state.gameTime !== 3) {
      next.votingStartFlg = true;
  }
  ```
- 100 / 200: dataSet 後、`socketInfo.userName === state.playerName` なら `redrawSeq + 1` と `artDataStrokeList: obj.artDataStrokeList`(200 はさらに messageList 追記)
- 150: dataSet 後、自分なら `playerData: null`(roominbtn の classList.remove は entered 導出により自動で外れる)
- 300: `{ ...state, startFlg: true, clearSeq: state.clearSeq + 1, personCanvasZindex: -1, disscuttionStartFlg: false, votingStartFlg: false, endFlg: false }` に dataSet
- 450: `list = obj.artDataStrokeList; last = list[list.length - 1]`。他人なら remoteStroke/remoteStrokeSeq 更新。`last.endFlg` なら dataSet + artDataStrokeList 更新(両方成立あり)
- 500: dataSet。`obj.gameTime == 4` なら `resultSeq + 1`

- [ ] **Step 4: フック実装 → ページ接続**

topic `` `/topic/${roomId}` ``。送信系(payload は現行どおり):

| 関数 | destination | status | obj |
|---|---|---|---|
| roomIn(userName) | /app/game-roomin | 100 | null |
| chat(message) | /app/game-chat | 101 | null(playerData がある時のみ) |
| roomRemove(userName) | /app/game-removeuser | 150 | userName |
| changeRadio(patternNo) | /app/fakeartist-setpattern | 160 | state.patternList をトグルした dataList(現行ロジック) |
| init() | /app/fakeartist-init | 300 | null |
| draw(artDataStroke) | /app/fakeartist-drawing | 450 | `{ ...artDataStroke, name: playerName }` |
| vote(target) | /app/fakeartist-voting | 500 | targetUsername |
| changeLimitTime(time) | /app/game-setlimittime | 550 | time(userName: null) |
| limittimeDone() | /app/game-dooverLimit | 600 | turn(gameTime===2 のみ、userName: null) |
| changeIcon(iconUrl) | /app/game-changeIcon | 650 | iconUrl |

副作用(useEffect):

| 現行 | 移行後 |
|---|---|
| case 100/200 の drawCanvas | `state.redrawSeq` 監視(0 は無視)→ `drawCanvas(state.artDataStrokeList)` |
| case 450 の callBackDraw | `state.remoteStrokeSeq` 監視(0 は無視)→ `callBackDraw(state.remoteStroke)` |
| case 300 の clear() | `state.clearSeq` 監視(0 は無視)→ `clear()` |
| case 500 の モバイル endFlg 遅延 | `state.resultSeq` 監視(0 は無視)→ `clientWidth < 769` なら setTimeout(() => dispatch showEnd, 3000) |
| startFlg 監視(ヘッダチェック操作 + scrollTo + 4秒後解除 + clear + モバイル再チェック) | `state.startFlg` 監視 → 現行 L501-527 をそのまま移設(`.fakeartistcheck` の DOM 操作はヘッダが共通コンポーネントのため現状維持。Stage 4 送り) |
| disscuttionStartFlg / votingStartFlg / endFlg の自動解除 | 各 state 監視 → setTimeout 3500 → dismiss 系 dispatch(votingStartFlg はヘッダチェックオフも現行どおり) |
| 入室時 classList + アイコン初期設定 | entered + iconInitialized パターン |
| playerData 設定 | reducer 内 keep-last に移行(effect 削除) |
| case 101 chat-firld scrollTop | chatList 監視(共通) |

`personCanpasMouseDown(userName)`: `dispatch setPersonCanvasZindex(1)` + `drawPersonCanvas(state.artDataStrokeList, userName)`(イベント駆動の描画なので effect にせず直接呼ぶ)。`personCanpasMouseUp`: `dispatch setPersonCanvasZindex(-1)`。

ページ接続: useState 18個・getMessage・dataSet・useEffect 8本・モジュールスコープの canvas 関数(canvasDraw.ts へ移設済み)を削除。

- [ ] **Step 5: 検証と Commit**

Run: `npm test && npm run lint && npm run build`
Run: `npm run dev` → 2タブで fakeartist: 入室 → テーマ種類変更 → GAME START → 描画が他タブに同期 → 手番交代 → 議論 → 投票 → 結果。再入室で既存の絵が復元されることも確認。

```bash
git add src/features/fakeartist/ src/pages/fakeartist/
git commit -m "fakeartistの受信処理をreducer化しフックに接続"
```

---

### Task 12: fakeartist コンポーネント分割

**Files:**
- Move: `src/components/fakeartist/*` → `src/features/fakeartist/components/`(canvas / fakeartisticon / fakeartistuserInfo / headInfo / userInfoshort)
- Create: `src/features/fakeartist/components/GameHeader.tsx`(役職・テーマ・進行ヘッダ L639-725)
- Create: `src/features/fakeartist/components/ThemeSelector.tsx`(テーマの種類 RadioChips ブロック L913-954)
- Create: `src/features/fakeartist/components/LimitTimeSelector.tsx`(制限時間ブロック L956-1040)
- Modify: `src/pages/fakeartist/[roomId].tsx`(薄型化 + RoomInForm)

**Interfaces:**
- Consumes: `useFakeartistRoom`(Task 11)、`RoomInForm`

- [ ] **Step 1: git mv + コンポーネント切り出し + ページ薄型化**

```bash
git mv src/components/fakeartist src/features/fakeartist/components
```

現行 JSX を props 参照でそのまま移設(ロジック変更なし)。ページは 100〜150 行の入り口にする。

- [ ] **Step 2: 検証と Commit**

Run: `npm test && npm run lint && npm run build` → `npm run dev` で fakeartist 再確認(描画同期・個人キャンバス長押し表示)。

```bash
git add -A src/
git commit -m "fakeartistをfeature構造に分割しページを薄型化"
```

---

### Task 13: Stage 3 完了検証

**Files:**
- Modify: `docs/plans/stage3-structure.md`(検証記録)

**Interfaces:**
- Consumes: Task 1〜12 の全成果物

- [ ] **Step 1: 旧構造の残骸が無いことを確認**

Run: `grep -rn "components/hideout\|components/decrypt\|components/werewolf\|components/fakeartist\|components/timebomb/start\|components/timebomb/headInfo\|components/timebomb/userInfo" src`
Expected: ヒット 0 件。

Run: `grep -rn "getMessage\|dataSet\|receve" src/pages`
Expected: ヒット 0 件(全ゲームが reducer 化済み)。

- [ ] **Step 2: ページ行数の確認**

Run: `wc -l src/pages/*/\[roomId\].tsx`
Expected: 各ページ 150 行以下(hideout / decrypt / timebomb は 100 行以下目安)。

- [ ] **Step 3: 全チェック**

Run: `npm test && npm run lint && npm run build`
Expected: テスト全 PASS(reducer 5ゲーム + useGameSocket 12件 + next.config 3件)、lint error 0、build 成功。

- [ ] **Step 4: 全5ゲーム最終確認(本番 Heroku 接続、2タブ)**

- [ ] hideout: 入室 → 開始 → 待機/突入 → 勝敗
- [ ] decrypt: 入室 → チーム選択 → 開始 → 暗号作成 → 解読
- [ ] timebomb: 入室 → 開始 → カード公開 → ラウンド演出 → 設定同期 → 勝敗
- [ ] werewolf: 入室 → 役職カスタマイズ → 開始 → 役職選択 → アクション(カットイン/銃声)→ 投票 → 勝敗
- [ ] fakeartist: 入室 → 開始 → 描画同期 → 議論 → 投票 → 結果、再入室で絵の復元
- [ ] コンソールエラーが無いこと

- [ ] **Step 5: 検証記録を記入して Commit**

本ファイル末尾の「検証記録」に、結果と意図的な挙動差分の一覧を記入:

```bash
git add ../docs/plans/stage3-structure.md
git commit -m "Stage 3検証結果を記録"
```

---

## 意図的な挙動差分(実装中に追記)

計画時点で確定しているもの:

1. **stale closure の解消**(全ゲーム): `messageList.concat` 等がコールバック生成時の古い値を掴む問題は reducer 化で構造的に解消。連続受信時にメッセージが欠落しなくなる(修正方向の差分)
2. **入室フォームの classList 直接操作 → entered 導出**: ユーザーがルームから消えた場合にフォームが再表示されるようになる(現行は一度 in が付くと外れない。fakeartist の退出処理と整合する修正方向の差分)
3. **decrypt の入室フォームに disabled 追加**: RoomInForm 共通化により未接続時は入室不可になる(他4ゲームと同じ挙動に統一)
4. **timebomb のデバッグ用非表示入室ブロック削除**(`false && (...)`)
5. **werewolf 役職カウンターの DOM 直接操作 → state 化**: 見た目・操作は同一。カウンター値がサーバ受信(rollNoList)で正しくリセットされる点も現行 `setRollCustum` と同等
6. **非制御 input(username)→ 制御 input**: 見た目・操作は同一

## 検証記録

(Task 13 実施時に記入)
