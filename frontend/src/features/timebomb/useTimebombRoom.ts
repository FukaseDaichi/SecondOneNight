import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useGameSocket } from '../../lib/stomp/useGameSocket';
import type { RoomUserInfo, SocketInfo, TimeBombUser } from '../../type';
import { timebombReducer, initialTimebombState } from './reducer';

export function useTimebombRoom(roomId: string | undefined) {
    const [state, dispatch] = useReducer(timebombReducer, initialTimebombState);

    const { connected, status, send } = useGameSocket({
        topic: `/topic/${roomId}/timebomb`,
        onMessage: (msg) => dispatch({ type: 'message', payload: msg }),
        enabled: !!roomId,
    });

    const conect = useCallback(
        (url: string, msg: RoomUserInfo) => {
            try {
                send(url, msg);
            } catch (e) {
                dispatch({
                    type: 'systemMessage',
                    text: '通信エラー。再度試してください',
                });
            }
        },
        [send]
    );

    // --- 送信系(現行ページの roomIn / start / play / changeIcon / limittimeDone / changeLimitTme / changeSecretFlg と同一 payload) ---
    const roomIn = useCallback(
        (msg: RoomUserInfo) => {
            dispatch({ type: 'roomIn', userName: msg.userName });
            conect('/app/roomin', msg);
        },
        [conect]
    );

    const start = useCallback(
        (msg: RoomUserInfo) => {
            conect('/app/start', msg);
        },
        [conect]
    );

    const play = useCallback(
        (cardIndex: number) => {
            const data: RoomUserInfo = {
                action: 'play',
                roomId: roomId as string,
                userName: state.playerName,
                cardIndex: cardIndex,
                winTeam: 0,
            };
            conect('/app/play', data);
        },
        [conect, roomId, state.playerName]
    );

    const changeIcon = useCallback(
        (iconUrl: string) => {
            const usrInfo: RoomUserInfo = {
                action: iconUrl,
                roomId: roomId as string,
                userName: state.playerName,
                cardIndex: 0,
                winTeam: 0,
            };
            conect('/app/changeIcon', usrInfo);
        },
        [conect, roomId, state.playerName]
    );

    const limittimeDone = useCallback(
        (pturn: number) => {
            let turnFlg = false;
            state.timeBombUserList.forEach((value: TimeBombUser) => {
                if (value.userName === state.playerName && value.turnFlg) {
                    turnFlg = true;
                }
            });

            if (turnFlg) {
                const info: SocketInfo = {
                    status: 600,
                    roomId: roomId as string,
                    userName: state.playerName,
                    message: null,
                    obj: pturn,
                };
                try {
                    send('/app/timebomb-limittime', info);
                } catch (e) {
                    // 処理なし(現行維持)
                }
            }
        },
        [send, roomId, state.playerName, state.timeBombUserList]
    );

    // 現行同様 try/catch なし(例外は伝播させる)
    const changeLimitTme = useCallback(
        (time: number) => {
            const info: SocketInfo = {
                status: 900,
                roomId: roomId as string,
                userName: state.playerName,
                message: null,
                obj: time,
            };
            send('/app/timebomb-setlimittime', info);
        },
        [send, roomId, state.playerName]
    );

    // 現行同様 try/catch なし(例外は伝播させる)
    const changeSecretFlg = useCallback(() => {
        const info: SocketInfo = {
            status: 800,
            roomId: roomId as string,
            userName: state.playerName,
            message: null,
            obj: null,
        };
        send('/app/timebomb-changesecret', info);
    }, [send, roomId, state.playerName]);

    // --- ローカルUI操作 ---
    const dismissStart = useCallback(() => dispatch({ type: 'dismissStart' }), []);
    const dismissRoundMessage = useCallback(
        () => dispatch({ type: 'dismissRoundMessage' }),
        []
    );

    // --- 副作用(現行 useEffect の写し) ---
    // スタート表示: 4秒後に自動で下ろす
    useEffect(() => {
        if (state.startFlg) {
            const id = window.setTimeout(() => dismissStart(), 4000);
            return () => window.clearTimeout(id);
        }
    }, [state.startFlg, dismissStart]);

    // ラウンドメッセージ表示: 5秒後に modal_active を外して下ろす
    useEffect(() => {
        if (state.roundMessageFlg) {
            const id = window.setTimeout(() => {
                document.body.classList.remove('modal_active');
                dismissRoundMessage();
            }, 5000);
            return () => window.clearTimeout(id);
        }
    }, [state.roundMessageFlg, dismissRoundMessage]);

    // roundMessageFlg 立ち上がり時: ラウンド進行(2周目以降)の瞬間に先頭へスクロール(現行 setData 内の同期 scrollTo(0, 0))
    const prevRoundMessageFlgRef = useRef(state.roundMessageFlg);
    useEffect(() => {
        if (state.roundMessageFlg && !prevRoundMessageFlgRef.current) {
            scrollTo(0, 0);
        }
        prevRoundMessageFlgRef.current = state.roundMessageFlg;
    }, [state.roundMessageFlg]);

    // startFlg 立ち上がり時: modal_active を外して先頭へスクロール(現行 msg.turn===1 時の処理)
    const prevStartFlgRef = useRef(state.startFlg);
    useEffect(() => {
        if (state.startFlg && !prevStartFlgRef.current) {
            document.body.classList.remove('modal_active');
            scrollTo(0, 0);
        }
        prevStartFlgRef.current = state.startFlg;
    }, [state.startFlg]);

    // 勝敗表示 立ち上がり時: 先頭へスクロール
    const prevWinRef = useRef(state.policeFlg || state.bommerFlg);
    useEffect(() => {
        const win = state.policeFlg || state.bommerFlg;
        if (win && !prevWinRef.current) {
            scrollTo(0, 0);
        }
        prevWinRef.current = win;
    }, [state.policeFlg, state.bommerFlg]);

    // 入室検知(classList 操作は entered の導出に置換。timebomb はアイコン初期設定なし)
    const own = state.timeBombUserList.filter(
        (u: TimeBombUser) => u.userName === state.playerName
    )[0];
    const entered = !!own;

    return {
        state,
        connected,
        status,
        entered,
        roomIn,
        start,
        play,
        changeIcon,
        limittimeDone,
        changeLimitTme,
        changeSecretFlg,
    };
}
