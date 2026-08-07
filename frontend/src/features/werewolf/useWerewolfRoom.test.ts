import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// onConnect のみ使う最小限の形状(StompConfig 全体は不要)
type MockConfig = { onConnect: () => void };

// @stomp/stompjs の Client をモック(useGameSocket.test.ts と同じ手法)。
// useWerewolfRoom は useGameSocket をラップしているだけなので、
// 実接続を模擬して roomIn が publish を呼ぶかどうかを直接検証できる。
vi.mock('@stomp/stompjs', () => {
    class MockClient {
        config: MockConfig;
        connected = false;
        activate = vi.fn();
        deactivate = vi.fn(() => Promise.resolve());
        subscribe = vi.fn(() => ({ unsubscribe: vi.fn() }));
        publish = vi.fn();
        static instances: MockClient[] = [];
        constructor(config: MockConfig) {
            this.config = config;
            MockClient.instances.push(this);
        }
        // テスト用: 接続確立を模擬
        _open() {
            this.connected = true;
            this.config.onConnect();
        }
    }
    return { Client: MockClient };
});

// sockjs-client は webSocketFactory 内でのみ参照。実接続させないためモック
vi.mock('sockjs-client', () => ({ default: vi.fn() }));

import { Client } from '@stomp/stompjs';
import { useWerewolfRoom } from './useWerewolfRoom';

// モック側の MockClient は vi.mock のファクトリ内に閉じているため、
// 外側ではテストが参照するプロパティだけを持つ最小限の形状で型付けする
interface MockClientInstance {
    publish: ReturnType<typeof vi.fn>;
    config: MockConfig;
    _open: () => void;
}

const MockClient = Client as unknown as { instances: MockClientInstance[] };

beforeEach(() => {
    MockClient.instances.length = 0;
});

describe('useWerewolfRoom roomIn (通信層のガード)', () => {
    it('空文字では送信しない', () => {
        const { result } = renderHook(() => useWerewolfRoom('room1'));
        act(() => MockClient.instances[0]._open());

        act(() => result.current.roomIn(''));

        expect(MockClient.instances[0].publish).not.toHaveBeenCalled();
    });

    it('空白のみでは送信しない(trimガード)', () => {
        const { result } = renderHook(() => useWerewolfRoom('room1'));
        act(() => MockClient.instances[0]._open());

        act(() => result.current.roomIn('   '));

        expect(MockClient.instances[0].publish).not.toHaveBeenCalled();
    });

    it('前後空白つきの有効な名前は trim せずそのまま送信する', () => {
        const { result } = renderHook(() => useWerewolfRoom('room1'));
        act(() => MockClient.instances[0]._open());

        act(() => result.current.roomIn(' たろう '));

        expect(MockClient.instances[0].publish).toHaveBeenCalledWith({
            destination: '/app/game-roomin',
            body: JSON.stringify({
                status: 100,
                roomId: 'room1',
                userName: ' たろう ',
                message: null,
                obj: null,
            }),
        });
    });
});
