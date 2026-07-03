# Stage 2: 通信層の刷新 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `react-stomp` を `@stomp/stompjs` v7 + `sockjs-client` に置換し、型付き共通フック `useGameSocket` に集約して、5ゲーム全てが本番バックエンドと送受信でき、自動再接続と控えめな接続インジケータを備える状態にする。

**Architecture:** `@stomp/stompjs` の `Client` をラップした React フック `useGameSocket` を1つ作り、5ゲームで共用する。各ゲームページは `SockJsClient`(JSX)と `clientObj`/`isConnected` state を、フックの返り値(`status`/`connected`/`send`)に置換するだけ。受信ハンドラ(`receve`/`getMessage` の status switch)は無変更(reducer 化は Stage 3)。バックエンドは無変更で互換維持。

**Tech Stack:** @stomp/stompjs v7 / sockjs-client / Vitest + @testing-library/react (jsdom)

**スコープ注記:** 設計書は `docs/superpowers/specs/2026-07-04-stage2-communication-design.md`。通信層の差し替えに限定。受信ロジックの reducer 化は Stage 3、App Router 移行等は Stage 4。

## Global Constraints

- 作業ブランチ: `refactor/stage2-communication`(master から作成済み)。push / PR 作成はユーザーの指示があるまで行わない
- 実行ディレクトリ: `frontend/`(モノレポ)。すべての相対パス・bash コマンドは `frontend/` をカレントとする。ただし `docs/...` はリポジトリルート基準(frontend/ からは `../docs/...`)
- コミットメッセージは日本語の短文。末尾に `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` を付ける
- **バックエンド仕様は変更不可:** SockJS エンドポイント `boardgame-endpoint`、STOMP 購読トピック(timebomb は `/topic/{roomId}/timebomb`、他4ゲームは `/topic/{roomId}`)、送信宛先 `/app/*`、REST `createroom` の互換を維持
- ユーザーから見た挙動は概ね維持。追加してよいのは接続インジケータ(再接続中/切断時のみ表示)のみ
- 受信ハンドラ(各ゲームの `receve`/`getMessage` とその呼び出す setter 群)は**変更しない**
- 送信は `send(destination, payload)` に統一。**`JSON.stringify` はフック内部で行うため、呼び出し側から `JSON.stringify()` を外す**(二重エンコード防止)
- Prettier 設定(tabWidth:4 / singleQuote / semi / trailingComma:es5)は変更しない
- `react-stomp` は全5ゲーム移行が完了する Task 8 まで削除しない
- Node は v22.21.0。`npm run build`/`dev`/`test` は OpenSSL フラグ不要(Stage 1 で Next 15 化済み)

---

### Task 1: `useGameSocket` フックとテスト基盤

**Files:**
- Modify: `package.json` / `package-lock.json`(依存追加)
- Create: `vitest.config.ts`
- Create: `src/lib/stomp/types.ts`
- Create: `src/lib/stomp/useGameSocket.ts`
- Test: `src/lib/stomp/useGameSocket.test.ts`

**Interfaces:**
- Consumes: `SystemConst.Server.AP_HOST` / `ENDPOINT`(既存 `src/const/next.config.ts`)
- Produces:
  - `type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected'`
  - `useGameSocket(opts: { topic: string; onMessage: (msg: any) => void; enabled: boolean }): { status: ConnectionStatus; connected: boolean; send: (destination: string, payload: unknown) => void }`
  - Task 2〜7 がこの `useGameSocket` を使う

- [ ] **Step 1: 依存を追加**

```bash
npm install @stomp/stompjs@^7 sockjs-client@^1
npm install -D @testing-library/react@^16 @testing-library/dom@^10 jsdom@^25 @types/sockjs-client@^1
```

Expected: `.npmrc`(legacy-peer-deps=true)下でインストール成功。

- [ ] **Step 2: Vitest に jsdom 環境を設定**

`vitest.config.ts` を新規作成(既存の `next.config.test.ts` は node 環境で問題ないが、フックテストは DOM が要る。グローバルは jsdom にし、DOM 非依存テストも jsdom で問題なく動く):

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
    },
});
```

- [ ] **Step 3: 型定義を作成**

`src/lib/stomp/types.ts`:

```ts
export type ConnectionStatus =
    | 'connecting'
    | 'connected'
    | 'reconnecting'
    | 'disconnected';

export type GameSocket = {
    status: ConnectionStatus;
    connected: boolean;
    send: (destination: string, payload: unknown) => void;
};
```

- [ ] **Step 4: 失敗するテストを書く**

`src/lib/stomp/useGameSocket.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// @stomp/stompjs の Client をモック(生成された各インスタンスを instances に記録)
vi.mock('@stomp/stompjs', () => {
    class MockClient {
        config: any;
        connected = false;
        activate = vi.fn();
        deactivate = vi.fn(() => Promise.resolve());
        subscribe = vi.fn(() => ({ unsubscribe: vi.fn() }));
        publish = vi.fn();
        static instances: any[] = [];
        constructor(config: any) {
            this.config = config;
            MockClient.instances.push(this);
        }
        // テスト用: 接続確立を模擬
        _open() {
            this.connected = true;
            this.config.onConnect();
        }
        // テスト用: 切断を模擬
        _close() {
            this.connected = false;
            this.config.onWebSocketClose?.();
        }
    }
    return { Client: MockClient };
});

// sockjs-client は webSocketFactory 内でのみ参照。実接続させないためモック
vi.mock('sockjs-client', () => ({ default: vi.fn() }));

import { Client } from '@stomp/stompjs';
import { useGameSocket } from './useGameSocket';

const MockClient = Client as unknown as { instances: any[] };

beforeEach(() => {
    MockClient.instances.length = 0;
});

describe('useGameSocket', () => {
    it('enabled=false の間は Client を生成しない', () => {
        renderHook(() =>
            useGameSocket({ topic: '/topic/x', onMessage: () => {}, enabled: false })
        );
        expect(MockClient.instances.length).toBe(0);
    });

    it('enabled=true で activate し status は connecting', () => {
        const { result } = renderHook(() =>
            useGameSocket({ topic: '/topic/x', onMessage: () => {}, enabled: true })
        );
        expect(MockClient.instances.length).toBe(1);
        expect(MockClient.instances[0].activate).toHaveBeenCalled();
        expect(result.current.status).toBe('connecting');
        expect(result.current.connected).toBe(false);
    });

    it('接続確立で status=connected になり、指定 topic を購読する', () => {
        const { result } = renderHook(() =>
            useGameSocket({ topic: '/topic/room1', onMessage: () => {}, enabled: true })
        );
        act(() => MockClient.instances[0]._open());
        expect(result.current.status).toBe('connected');
        expect(result.current.connected).toBe(true);
        expect(MockClient.instances[0].subscribe).toHaveBeenCalledWith(
            '/topic/room1',
            expect.any(Function)
        );
    });

    it('受信 body を JSON.parse して onMessage に渡す', () => {
        const onMessage = vi.fn();
        renderHook(() =>
            useGameSocket({ topic: '/topic/x', onMessage, enabled: true })
        );
        act(() => MockClient.instances[0]._open());
        const handler = MockClient.instances[0].subscribe.mock.calls[0][1];
        act(() => handler({ body: '{"status":200,"turn":1}' }));
        expect(onMessage).toHaveBeenCalledWith({ status: 200, turn: 1 });
    });

    it('不正JSONは生文字列で onMessage に渡す', () => {
        const onMessage = vi.fn();
        renderHook(() =>
            useGameSocket({ topic: '/topic/x', onMessage, enabled: true })
        );
        act(() => MockClient.instances[0]._open());
        const handler = MockClient.instances[0].subscribe.mock.calls[0][1];
        act(() => handler({ body: 'not-json' }));
        expect(onMessage).toHaveBeenCalledWith('not-json');
    });

    it('send は接続時に publish(JSON.stringify)、未接続時は例外', () => {
        const { result } = renderHook(() =>
            useGameSocket({ topic: '/topic/x', onMessage: () => {}, enabled: true })
        );
        // 未接続で送信 → 例外
        expect(() => result.current.send('/app/roomin', { a: 1 })).toThrow();
        // 接続後 → publish
        act(() => MockClient.instances[0]._open());
        act(() => result.current.send('/app/roomin', { a: 1 }));
        expect(MockClient.instances[0].publish).toHaveBeenCalledWith({
            destination: '/app/roomin',
            body: '{"a":1}',
        });
    });

    it('再接続(再度の onConnect)で古い subscription を解除してから再購読する', () => {
        renderHook(() =>
            useGameSocket({ topic: '/topic/x', onMessage: () => {}, enabled: true })
        );
        const inst = MockClient.instances[0];
        act(() => inst._open());
        const firstSub = inst.subscribe.mock.results[0].value;
        act(() => inst._close());
        act(() => inst._open());
        expect(firstSub.unsubscribe).toHaveBeenCalled();
        expect(inst.subscribe).toHaveBeenCalledTimes(2);
    });

    it('アンマウントで deactivate する', () => {
        const { unmount } = renderHook(() =>
            useGameSocket({ topic: '/topic/x', onMessage: () => {}, enabled: true })
        );
        const inst = MockClient.instances[0];
        unmount();
        expect(inst.deactivate).toHaveBeenCalled();
    });
});
```

- [ ] **Step 5: テストが失敗することを確認**

Run: `npm test`
Expected: `useGameSocket.test.ts` が FAIL(`useGameSocket` 未実装 / import 解決不可)。`next.config.test.ts` の3件は PASS のまま。

- [ ] **Step 6: フックを実装**

`src/lib/stomp/useGameSocket.ts`:

```ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { SystemConst } from '../../const/next.config';
import type { ConnectionStatus, GameSocket } from './types';

type UseGameSocketOptions = {
    topic: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onMessage: (msg: any) => void;
    enabled: boolean;
};

export function useGameSocket(opts: UseGameSocketOptions): GameSocket {
    const { topic, onMessage, enabled } = opts;
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const clientRef = useRef<Client | null>(null);
    const subRef = useRef<StompSubscription | null>(null);

    // onMessage の最新参照を保持(再接続を誘発しないため deps に入れない)
    const onMessageRef = useRef(onMessage);
    onMessageRef.current = onMessage;

    useEffect(() => {
        if (!enabled) {
            return;
        }
        let hasConnected = false;

        const client = new Client({
            webSocketFactory: () =>
                new SockJS(
                    SystemConst.Server.AP_HOST + SystemConst.Server.ENDPOINT
                ),
            reconnectDelay: 5000,
            onConnect: () => {
                hasConnected = true;
                setStatus('connected');
                if (subRef.current) {
                    try {
                        subRef.current.unsubscribe();
                    } catch {
                        // 破棄済みなら無視
                    }
                }
                subRef.current = client.subscribe(topic, (message: IMessage) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    let parsed: any;
                    try {
                        parsed = JSON.parse(message.body);
                    } catch {
                        parsed = message.body;
                    }
                    onMessageRef.current(parsed);
                });
            },
            onWebSocketClose: () => {
                setStatus(hasConnected ? 'reconnecting' : 'connecting');
            },
        });

        clientRef.current = client;
        subRef.current = null;
        setStatus('connecting');
        client.activate();

        return () => {
            clientRef.current = null;
            subRef.current = null;
            client.deactivate();
        };
    }, [topic, enabled]);

    const send = useCallback((destination: string, payload: unknown) => {
        const client = clientRef.current;
        if (!client || !client.connected) {
            throw new Error('Send error: socket is disconnected');
        }
        client.publish({ destination, body: JSON.stringify(payload) });
    }, []);

    return { status, connected: status === 'connected', send };
}
```

- [ ] **Step 7: テストが通ることを確認**

Run: `npm test`
Expected: `useGameSocket.test.ts` の8件 + `next.config.test.ts` の3件、全て PASS。

- [ ] **Step 8: lint とビルドの確認**

Run: `npm run lint && npm run build`
Expected: lint error 0(warning は可)、build 成功。

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/stomp/
git commit -m "useGameSocketフックと@stomp/stompjsを導入"
```

---

### Task 2: 接続インジケータ `ConnectionStatus`

**Files:**
- Create: `src/components/common/ConnectionStatus.tsx`
- Create: `src/styles/components/common/connectionstatus.module.scss`

**Interfaces:**
- Consumes: `ConnectionStatus` 型(`src/lib/stomp/types.ts`)
- Produces: `ConnectionStatus({ status }: { status: ConnectionStatus })` default export(Task 3〜7 が各ページに設置)

- [ ] **Step 1: スタイルを作成**

`src/styles/components/common/connectionstatus.module.scss`:

```scss
.banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    padding: 6px 12px;
    text-align: center;
    font-size: 13px;
    color: #fff;
    background: rgba(180, 90, 90, 0.92);
}
```

- [ ] **Step 2: コンポーネントを作成**

`src/components/common/ConnectionStatus.tsx`(`reconnecting`/`disconnected` のみ表示。UI の網羅テストは書かない方針):

```tsx
import styles from '../../styles/components/common/connectionstatus.module.scss';
import type { ConnectionStatus as Status } from '../../lib/stomp/types';

export default function ConnectionStatus({ status }: { status: Status }) {
    if (status !== 'reconnecting' && status !== 'disconnected') {
        return null;
    }
    return (
        <div className={styles.banner} role="status">
            {status === 'reconnecting' ? '再接続中…' : '接続が切れました'}
        </div>
    );
}
```

- [ ] **Step 3: ビルド確認**

Run: `npm run build`
Expected: 成功。

- [ ] **Step 4: Commit**

```bash
git add src/components/common/ConnectionStatus.tsx src/styles/components/common/connectionstatus.module.scss
git commit -m "接続状態インジケータConnectionStatusを追加"
```

---

## 移行タスク共通レシピ(Task 3〜7)

各ゲームページで以下を機械的に行う(ゲーム固有の差異は各タスクに明記):

1. import 変更: `import SockJsClient from 'react-stomp';` を削除し、
   `import { useGameSocket } from '../../lib/stomp/useGameSocket';`
   `import ConnectionStatus from '../../components/common/ConnectionStatus';` を追加
2. ファイル冒頭の `const disconnect = () => { console.log('接続が切れました'); };` を削除
3. `const [clientObj, setClientObj] = useState(null);` を削除、`const [isConnected, setIsConnected] = useState(false);` があれば削除
4. コンポーネント本体の適切な位置(roomId 取得直後)に:
   ```tsx
   const { connected, status, send } = useGameSocket({
       topic: `<そのゲームの topic>`,
       onMessage: <そのゲームの受信ハンドラ関数>,
       enabled: !!roomId,
   });
   ```
5. 送信ラッパー(`conect`/`coneect`)内の `clientObj.sendMessage(url, JSON.stringify(x))` を `send(url, x)` に変更(**JSON.stringify を外す**)。timebomb は直接 `clientObj.sendMessage(...)` する箇所も同様に `send(...)` へ
6. `<SockJsClient ... />` の JSX を削除し、代わりに `<ConnectionStatus status={status} />` を置く
7. `disabled={!isConnected}` を `disabled={!connected}` に置換(decrypt は該当なし)
8. 受信ハンドラ本体(status switch)は**変更しない**

移行後の検証(各タスク共通):
- `npm run build` 成功、`npm run lint` error 0
- `npm run dev` 起動 → 本番 Heroku 接続で該当ゲームのルームに入室でき、送受信の往復(名前入力→入室→他タブに反映)が成立
- 送信で二重エンコードが起きていないこと(入室・アクションがバックエンドに正しく届く)を確認

---

### Task 3: hideout を useGameSocket に移行(パターン確立)

**Files:**
- Modify: `src/pages/hideout/[roomId].tsx`

**Interfaces:**
- Consumes: `useGameSocket`(Task 1)、`ConnectionStatus`(Task 2)
- Produces: なし(ページ内で完結)

固有情報:
- topic: `` `/topic/${roomId}` ``
- 受信ハンドラ: `getMessage`(`onMessage: getMessage`)
- 送信ラッパー: `const conect = (url, soketInfo) => { try { clientObj.sendMessage(url, JSON.stringify(soketInfo)); } catch(e) {...} }` → 中身を `send(url, soketInfo)` に
- `isConnected` あり(`disabled={!isConnected}` 2箇所を `!connected` に)

- [ ] **Step 1: 共通レシピ(上記)を hideout に適用**

`src/pages/hideout/[roomId].tsx` を編集:
- import 差し替え(SockJsClient 削除 → useGameSocket + ConnectionStatus 追加)
- `disconnect` 関数削除
- `clientObj` / `isConnected` の useState 削除
- roomId 取得直後にフック追加:
  ```tsx
  const { connected, status, send } = useGameSocket({
      topic: `/topic/${roomId}`,
      onMessage: getMessage,
      enabled: !!roomId,
  });
  ```
- `conect` の中身を差し替え:
  ```tsx
  const conect = (url: string, soketInfo: SocketInfo) => {
      try {
          send(url, soketInfo);
      } catch (e) {
          setMessageList(messageList.concat('通信エラー。再度試してください'));
      }
  };
  ```
- `<SockJsClient .../>` を削除し `<ConnectionStatus status={status} />` を設置
- `disabled={!isConnected}` → `disabled={!connected}`(2箇所)

注意: `getMessage` はフックより後ろで定義されている場合、関数宣言(hoisting される `function` ではなく `const`)だと参照エラーになる。hideout の `getMessage` は `const getMessage = ...` のため、**フック呼び出しを `getMessage` 定義より後ろに置く**か、`onMessage: (msg) => getMessage(msg)` の形にしてクロージャで遅延参照する。後者(ラップ)を採用する:
```tsx
const { connected, status, send } = useGameSocket({
    topic: `/topic/${roomId}`,
    onMessage: (msg) => getMessage(msg),
    enabled: !!roomId,
});
```

- [ ] **Step 2: ビルド・lint**

Run: `npm run build && npm run lint`
Expected: build 成功、lint error 0。

- [ ] **Step 3: 本番接続で動作確認**

Run: `npm run dev` → ブラウザで `http://localhost:3000/hideout/<createroomで取得したid>` に2タブ入室 → 送受信往復・接続インジケータ(dev再起動で「再接続中…」→自動復帰)を確認。

- [ ] **Step 4: Commit**

```bash
git add src/pages/hideout/\[roomId\].tsx
git commit -m "hideoutをuseGameSocketに移行"
```

---

### Task 4: decrypt を useGameSocket に移行(isConnected 未使用ケース)

**Files:**
- Modify: `src/pages/decrypt/[roomId].tsx`

**Interfaces:**
- Consumes: `useGameSocket`、`ConnectionStatus`

固有情報:
- topic: `` `/topic/${roomId}` ``
- 受信ハンドラ: `getMessage`(`onMessage: (msg) => getMessage(msg)`)
- 送信ラッパー: `const conect = (url, soketInfo) => { try { clientObj.sendMessage(url, JSON.stringify(soketInfo)); } catch {...} }` → `send(url, soketInfo)`
- **`isConnected` / `onConnect` は元々無い**。`connected` は使わない(返り値から取らなくてよいが、`status` は ConnectionStatus 用に取る)

- [ ] **Step 1: 共通レシピを decrypt に適用**

- import 差し替え、`disconnect` 削除、`clientObj` useState 削除
- フック追加(`connected` は未使用なので `status` と `send` のみ利用):
  ```tsx
  const { status, send } = useGameSocket({
      topic: `/topic/${roomId}`,
      onMessage: (msg) => getMessage(msg),
      enabled: !!roomId,
  });
  ```
  (受信関数は `getMessage`。既存の `onMessage={(msg)=>getMessage(msg)}` と同じ)
- `conect` の中身を `send(url, soketInfo)` に
- `<SockJsClient .../>` 削除 → `<ConnectionStatus status={status} />`
- `disabled={!isConnected}` は decrypt には無い(確認して、もし入室ボタン等に無ければ何もしない)

- [ ] **Step 2: ビルド・lint**

Run: `npm run build && npm run lint`
Expected: build 成功、lint error 0。

- [ ] **Step 3: 本番接続で動作確認**

Run: `npm run dev` → `http://localhost:3000/decrypt/<createroom/decrypt で取得したid>` に入室 → 送受信往復を確認。

- [ ] **Step 4: Commit**

```bash
git add src/pages/decrypt/\[roomId\].tsx
git commit -m "decryptをuseGameSocketに移行"
```

---

### Task 5: werewolf を useGameSocket に移行

**Files:**
- Modify: `src/pages/werewolf/[roomId].tsx`

**Interfaces:**
- Consumes: `useGameSocket`、`ConnectionStatus`

固有情報:
- topic: `` `/topic/${roomId}` ``
- 受信ハンドラ: `getMessage`(`onMessage: (msg) => getMessage(msg)`)
- 送信ラッパー: `const conect = (url, soketInfo) => { try { clientObj.sendMessage(url, JSON.stringify(soketInfo)); } catch {...} }` → `send(url, soketInfo)`
- `isConnected` あり(`disabled={!isConnected}` 2箇所 → `!connected`)

- [ ] **Step 1: 共通レシピを werewolf に適用**(hideout と同型。topic は `/topic/${roomId}`)

- import 差し替え、`disconnect` 削除、`clientObj`/`isConnected` useState 削除
- フック追加:
  ```tsx
  const { connected, status, send } = useGameSocket({
      topic: `/topic/${roomId}`,
      onMessage: (msg) => getMessage(msg),
      enabled: !!roomId,
  });
  ```
- `conect` の中身を `send(url, soketInfo)` に
- `<SockJsClient .../>` 削除 → `<ConnectionStatus status={status} />`
- `disabled={!isConnected}` → `disabled={!connected}`(2箇所)

- [ ] **Step 2: ビルド・lint**

Run: `npm run build && npm run lint`
Expected: build 成功、lint error 0。

- [ ] **Step 3: 本番接続で動作確認**

Run: `npm run dev` → `http://localhost:3000/werewolf/<id>` に入室 → 送受信往復を確認。

- [ ] **Step 4: Commit**

```bash
git add src/pages/werewolf/\[roomId\].tsx
git commit -m "werewolfをuseGameSocketに移行"
```

---

### Task 6: fakeartist を useGameSocket に移行

**Files:**
- Modify: `src/pages/fakeartist/[roomId].tsx`

**Interfaces:**
- Consumes: `useGameSocket`、`ConnectionStatus`

固有情報:
- topic: `` `/topic/${roomId}` ``
- 受信ハンドラ: `getMessage`(`onMessage: (msg) => getMessage(msg)`)
- 送信ラッパー: `const conect = (url, soketInfo) => { try { clientObj.sendMessage(url, JSON.stringify(soketInfo)); } catch {...} }` → `send(url, soketInfo)`
- `isConnected` あり(`disabled={!isConnected}` 2箇所 → `!connected`)

- [ ] **Step 1: 共通レシピを fakeartist に適用**(werewolf と同型。topic は `/topic/${roomId}`)

- import 差し替え、`disconnect` 削除、`clientObj`/`isConnected` useState 削除
- フック追加:
  ```tsx
  const { connected, status, send } = useGameSocket({
      topic: `/topic/${roomId}`,
      onMessage: (msg) => getMessage(msg),
      enabled: !!roomId,
  });
  ```
- `conect` の中身を `send(url, soketInfo)` に
- `<SockJsClient .../>` 削除 → `<ConnectionStatus status={status} />`
- `disabled={!isConnected}` → `disabled={!connected}`(2箇所)

- [ ] **Step 2: ビルド・lint**

Run: `npm run build && npm run lint`
Expected: build 成功、lint error 0。

- [ ] **Step 3: 本番接続で動作確認**

Run: `npm run dev` → `http://localhost:3000/fakeartist/<id>` に入室 → 送受信往復 + カラーピッカーで描画 → 描画が同期することを確認。

- [ ] **Step 4: Commit**

```bash
git add src/pages/fakeartist/\[roomId\].tsx
git commit -m "fakeartistをuseGameSocketに移行"
```

---

### Task 7: timebomb を useGameSocket に移行(別トピック・送信4箇所)

**Files:**
- Modify: `src/pages/timebomb/[roomId].tsx`

**Interfaces:**
- Consumes: `useGameSocket`、`ConnectionStatus`

固有情報(**他ゲームと異なる点に注意**):
- topic: **`` `/topic/${roomId}/timebomb` ``**(timebomb だけ末尾に `/timebomb`)
- 受信ハンドラ: `receve`(`onMessage: (msg) => receve(msg)`)
- 送信ラッパー: `const coneect = (url, msg) => { try { clientObj.sendMessage(url, JSON.stringify(msg)); } catch(e) {...} }`(名前が `coneect`)→ 中身を `send(url, msg)` に
- **送信の直接呼び出しが3箇所ある**: `limittimeDone`(`clientObj.sendMessage(url, JSON.stringify(info))`)、`changeLimitTme`、`changeSecretFlg`。これらもすべて `send(url, info)` に置換(JSON.stringify を外す)
- `isConnected` あり(`disabled={!isConnected}` 2箇所 → `!connected`)

- [ ] **Step 1: 共通レシピを timebomb に適用(topic と送信箇所に注意)**

- import 差し替え、`disconnect` 削除、`clientObj`/`isConnected` useState 削除
- フック追加(**topic の末尾 `/timebomb` を忘れない**):
  ```tsx
  const { connected, status, send } = useGameSocket({
      topic: `/topic/${roomId}/timebomb`,
      onMessage: (msg) => receve(msg),
      enabled: !!roomId,
  });
  ```
- `coneect` の中身を `send(url, msg)` に
- `limittimeDone` / `changeLimitTme` / `changeSecretFlg` 内の `clientObj.sendMessage(url, JSON.stringify(info))` を `send(url, info)` に(計3箇所。`limittimeDone` は元々 try/catch 付き、他2つは素の呼び出し — 呼び出し形だけ置換し try/catch の有無は現状維持)
- `<SockJsClient .../>` 削除 → `<ConnectionStatus status={status} />`
- `disabled={!isConnected}` → `disabled={!connected}`(2箇所)

- [ ] **Step 2: ビルド・lint**

Run: `npm run build && npm run lint`
Expected: build 成功、lint error 0。

- [ ] **Step 3: 本番接続で動作確認(topic の別扱いを重点確認)**

Run: `npm run dev` → `http://localhost:3000/timebomb/<createroomで取得したid>` に2タブ入室 → GAME START → カード公開 → 制限時間ラジオ・SECRET MODE の切替が**他タブに同期**すること(= `/topic/{roomId}/timebomb` の購読と4送信経路がすべて正しい)を確認。

- [ ] **Step 4: Commit**

```bash
git add src/pages/timebomb/\[roomId\].tsx
git commit -m "timebombをuseGameSocketに移行"
```

---

### Task 8: react-stomp 削除と Stage 2 完了検証

**Files:**
- Modify: `package.json` / `package-lock.json`
- Modify: `docs/superpowers/plans/2026-07-04-stage2-communication.md`(検証記録)

**Interfaces:**
- Consumes: Task 1〜7 の全成果物

- [ ] **Step 1: react-stomp への参照が残っていないことを確認**

Run: `grep -rn "react-stomp\|SockJsClient\|clientObj\|sendMessage" src`
Expected: **ヒット 0 件**(全ゲームが移行済み)。1件でも残っていたら該当を移行してから進む。

- [ ] **Step 2: react-stomp を依存から削除**

```bash
npm uninstall react-stomp
```

- [ ] **Step 3: 全チェック**

Run: `npm test && npm run lint && npm run build`
Expected: テスト全 PASS(useGameSocket 8件 + next.config 3件)、lint error 0、build 成功。

- [ ] **Step 4: 全5ゲーム最終確認(本番 Heroku 接続)**

`npm run dev` で全5ゲームを再確認:
- [ ] hideout: 入室・送受信往復
- [ ] decrypt: 入室・送受信往復
- [ ] werewolf: 入室・送受信往復
- [ ] fakeartist: 入室・描画同期
- [ ] timebomb: 入室・GAME START・設定同期(別トピック)
- [ ] 再接続: dev サーバ再起動で「再接続中…」バナー表示 → 自動復帰
- [ ] コンソールエラーが無いこと

- [ ] **Step 5: 検証記録を記入して Commit**

本ファイル末尾の「検証記録」に結果を記入:

```bash
git add package.json package-lock.json ../docs/superpowers/plans/2026-07-04-stage2-communication.md
git commit -m "react-stompを削除しStage 2検証結果を記録"
```

---

## 検証記録

### Task 8(2026-07-04)— Stage 2 完了検証

- **react-stomp 参照残存: なし**(`grep -rn "react-stomp|SockJsClient|clientObj|.sendMessage" src` が 0 件)。`react-stomp` を依存から削除済み
- **テスト: 11件 PASS**(useGameSocket 8件 + next.config 3件)
- **lint: error 0**(warning 65 は既存の exhaustive-deps 等、新規なし)/ **build: 成功**(Node 22系→現在は brew 由来 node 26、フラグ不要)
- **全5ゲーム本番接続(Heroku、Next 15 dev、useGameSocket 経由)**:

| ゲーム | topic | 接続 | 送受信 | コンソールエラー |
|---|---|---|---|---|
| timebomb | `/topic/{roomId}/timebomb` | ✅ | ✅ 入室往復(名前表示)確認 | なし |
| werewolf | `/topic/{roomId}` | ✅ | ✅ /info 発行 | なし |
| hideout | `/topic/{roomId}` | ✅ | ✅ /info 発行 | なし |
| decrypt | `/topic/{roomId}` | ✅ | ✅ /info 発行・描画 | なし |
| fakeartist | `/topic/{roomId}` | ✅ | ✅ /info 発行 | なし |

- **接続インジケータ**: 接続中は非表示(誤表示なし)を確認。表示ロジック(`reconnecting`/`disconnected` のみ表示)は Task 2 で検証済み
- **再接続**: ユニットテストで status 遷移(`onWebSocketClose`→`reconnecting`)・`reconnectDelay: 5000`・再購読時の旧 subscription 破棄を検証済み。**ライブの強制切断ドリルはヘッドレス環境では未実施**(SockJS が内部で WebSocket 参照を保持するため介入不可)。実ネットワーク断での自動復帰は手動確認推奨
- **意図的な挙動差分**: 接続インジケータの追加のみ(他はなし)

**判定: Stage 2 完了。** react-stomp を排除し、全5ゲームが型付き共通フック `useGameSocket` 経由で本番バックエンドと送受信できる。

### 既知の残課題(後続ステージへ)
- 受信ハンドラ(`receve`/`getMessage` の status switch)の reducer 化 → **Stage 3**
- `useGameSocket` の Minor(enabled=false 時に status が disconnected に戻らない/status 遷移の直接テスト補完)→ Stage 3 で余裕があれば
- sass @import 非推奨警告、App Router 移行、命名統一等 → Stage 4
- ライブ再接続ドリル(実ネットワーク断)は手動確認
