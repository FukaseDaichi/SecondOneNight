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
