import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useGameSocket } from '../../lib/stomp/useGameSocket';
import type { SocketInfo } from '../../type';
import { decryptReducer, initialDecryptState } from './reducer';

export function useDecryptRoom(roomId: string | undefined) {
    const [state, dispatch] = useReducer(decryptReducer, initialDecryptState);

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

    // --- 送信系(現行ページの各関数と同一 payload) ---
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

    const changeIcon = useCallback(
        (iconUrl: string) => {
            conect('/app/game-changeIcon', buildInfo(650, iconUrl));
        },
        [conect, buildInfo]
    );

    const chat = useCallback(
        (message: string) => {
            if (state.playerData) {
                conect('/app/game-chat', {
                    ...buildInfo(101, null),
                    message,
                });
                dispatch({ type: 'chatSent', message });
            }
        },
        [conect, buildInfo, state.playerData]
    );

    const resetCode = useCallback(() => {
        conect('/app/decrypt-resetcode', buildInfo(110, null));
    }, [conect, buildInfo]);

    const resetTeam = useCallback(() => {
        conect('/app/decrypt-resetteam', buildInfo(120, null));
    }, [conect, buildInfo]);

    const choiceTeam = useCallback(
        (teamNo: number) => {
            conect('/app/decrypt-choiceteam', buildInfo(130, teamNo));
        },
        [conect, buildInfo]
    );

    const modeChange = useCallback(
        (modeNo: number) => {
            conect('/app/decrypt-modechange', buildInfo(140, modeNo));
        },
        [conect, buildInfo]
    );

    const init = useCallback(() => {
        conect('/app/decrypt-init', buildInfo(300, null));
    }, [conect, buildInfo]);

    const handupCreatecode = useCallback(() => {
        conect('/app/decrypt-handupcreatecode', buildInfo(350, null));
    }, [conect, buildInfo]);

    const createCodeword = useCallback(
        (wordList: Array<string>) => {
            conect('/app/decrypt-createcodeword', buildInfo(370, wordList));
        },
        [conect, buildInfo]
    );

    const decryptCode = useCallback(
        (noList: Array<number>) => {
            conect('/app/decrypt-decryptcode', buildInfo(500, noList));
        },
        [conect, buildInfo]
    );

    const changeLimitTime = useCallback(
        (time: number) => {
            conect('/app/game-setlimittime', {
                status: 550,
                roomId: roomId as string,
                userName: null,
                message: null,
                obj: time,
            });
        },
        [conect, roomId]
    );

    const limittimeDone = useCallback(() => {
        if (state.turn === 2) {
            conect('/app/game-dooverLimit', {
                status: 600,
                roomId: roomId as string,
                userName: null,
                message: null,
                obj: state.turn,
            });
        }
    }, [conect, roomId, state.turn]);

    // --- ローカルUI操作 ---
    const dismissStart = useCallback(
        () => dispatch({ type: 'dismissStart' }),
        []
    );

    // --- 副作用(現行 useEffect の写し) ---
    // スタート表示: 4秒後に自動で下ろす + 先頭へスクロール
    useEffect(() => {
        if (state.startFlg) {
            scrollTo(0, 0);
            const id = window.setTimeout(() => dismissStart(), 4000);
            return () => window.clearTimeout(id);
        }
    }, [state.startFlg, dismissStart]);

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
        changeIcon,
        resetCode,
        resetTeam,
        choiceTeam,
        modeChange,
        init,
        handupCreatecode,
        createCodeword,
        decryptCode,
        changeLimitTime,
        limittimeDone,
    };
}
