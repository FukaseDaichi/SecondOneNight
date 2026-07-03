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
    const closeRushArea = useCallback(
        () => dispatch({ type: 'closeRushArea' }),
        []
    );
    const dismissSwatWin = useCallback(
        () => dispatch({ type: 'dismissSwatWin' }),
        []
    );
    const dismissTerroristWin = useCallback(
        () => dispatch({ type: 'dismissTerroristWin' }),
        []
    );

    // --- 副作用(現行 useEffect の写し) ---
    // スタート表示: 4秒後に自動で下ろす + 先頭へスクロール
    useEffect(() => {
        if (state.startFlg) {
            scrollTo(0, 0);
            const id = window.setTimeout(
                () => dispatch({ type: 'dismissStart' }),
                4000
            );
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
    const own = state.userList.filter(
        (u) => u.userName === state.playerName
    )[0];
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
