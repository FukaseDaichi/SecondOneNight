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
            setStatus('disconnected');
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
