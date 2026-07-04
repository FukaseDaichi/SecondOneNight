import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useGameSocket } from '../../lib/stomp/useGameSocket';
import type { SocketInfo } from '../../type';
import type { ArtDataStroke } from '../../type/fakeartist';
import { callBackDraw, clear, drawCanvas, drawPersonCanvas } from './canvasDraw';
import { fakeartistReducer, initialFakeartistState } from './reducer';

export function useFakeartistRoom(roomId: string | undefined) {
    const [state, dispatch] = useReducer(
        fakeartistReducer,
        initialFakeartistState
    );

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

    // テーマ変更(現行ロジック: patternList をトグルした dataList を送る)
    const changeRadio = useCallback(
        (patternNo: number) => {
            let dataList: number[] = [];
            if (state.patternList.includes(patternNo)) {
                dataList = state.patternList.filter((no) => no !== patternNo);
            } else {
                dataList = [...state.patternList, patternNo];
            }
            conect('/app/fakeartist-setpattern', buildInfo(160, dataList));
        },
        [conect, buildInfo, state.patternList]
    );

    const roomRemove = useCallback(
        (userName: string) => {
            if (userName === '') {
                return;
            }
            conect('/app/game-removeuser', {
                status: 150,
                roomId: roomId as string,
                userName,
                message: null,
                obj: userName,
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

    const init = useCallback(() => {
        conect('/app/fakeartist-init', buildInfo(300, null));
    }, [conect, buildInfo]);

    const draw = useCallback(
        (artDataStroke: ArtDataStroke) => {
            const obj = { ...artDataStroke, name: state.playerName };
            conect('/app/fakeartist-drawing', buildInfo(450, obj));
        },
        [conect, buildInfo, state.playerName]
    );

    const vote = useCallback(
        (targetUsername: string) => {
            conect('/app/fakeartist-voting', buildInfo(500, targetUsername));
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
        if (state.gameTime === 2) {
            conect('/app/game-dooverLimit', {
                status: 600,
                roomId: roomId as string,
                userName: null,
                message: null,
                obj: state.turn,
            });
        }
    }, [conect, roomId, state.gameTime, state.turn]);

    // --- 個人描画(イベント駆動。effect にせず直接呼ぶ) ---
    const personCanpasMouseDown = useCallback(
        (userName: string) => {
            dispatch({ type: 'setPersonCanvasZindex', value: 1 });
            drawPersonCanvas(state.artDataStrokeList, userName);
        },
        [state.artDataStrokeList]
    );

    const personCanpasMouseUp = useCallback(() => {
        dispatch({ type: 'setPersonCanvasZindex', value: -1 });
    }, []);

    // --- 副作用(現行 useEffect の写し) ---
    // 全ストローク再描画(自分の入室/再入室時)
    useEffect(() => {
        if (state.redrawSeq === 0) {
            return;
        }
        drawCanvas(state.artDataStrokeList);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.redrawSeq]);

    // 他人の最新ストロークを描画
    useEffect(() => {
        if (state.remoteStrokeSeq === 0) {
            return;
        }
        if (state.remoteStroke) {
            callBackDraw(state.remoteStroke);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.remoteStrokeSeq]);

    // 全消去(ゲーム開始時)
    useEffect(() => {
        if (state.clearSeq === 0) {
            return;
        }
        clear();
    }, [state.clearSeq]);

    // 投票完了(gameTime 4 到達)。モバイル時の endFlg 遅延表示
    useEffect(() => {
        if (state.resultSeq === 0) {
            return;
        }
        if (document.documentElement.clientWidth < 769) {
            const id = window.setTimeout(() => {
                dispatch({ type: 'showEnd' });
            }, 3000);
            return () => window.clearTimeout(id);
        }
    }, [state.resultSeq]);

    // スタートフラグの監視(現行 L501-527 をそのまま移設)
    useEffect(() => {
        if (state.startFlg) {
            const headerDom = document.querySelector(
                '.fakeartistcheck'
            ) as HTMLInputElement;
            if (headerDom) {
                headerDom.checked = false;
            }

            scrollTo(0, 0);
            window.setTimeout(() => {
                dispatch({ type: 'dismissStart' });
                clear();

                if (document.documentElement.clientWidth < 769) {
                    window.setTimeout(() => {
                        const headerDomCheck = document.querySelector(
                            '.fakeartistcheck'
                        ) as HTMLInputElement;
                        if (headerDomCheck) {
                            headerDomCheck.checked = true;
                        }
                    }, 500);
                }
            }, 4000);
        }
    }, [state.startFlg]);

    // 議論開始フラグの監視
    useEffect(() => {
        if (state.disscuttionStartFlg) {
            const id = window.setTimeout(() => {
                dispatch({ type: 'dismissDisscuttionStart' });
            }, 3500);
            return () => window.clearTimeout(id);
        }
    }, [state.disscuttionStartFlg]);

    // 投票フラグの監視
    useEffect(() => {
        if (state.votingStartFlg) {
            // ヘッダーをオフ
            const headerDom = document.querySelector(
                '.fakeartistcheck'
            ) as HTMLInputElement;
            if (headerDom) {
                headerDom.checked = false;
            }

            const id = window.setTimeout(() => {
                dispatch({ type: 'dismissVotingStart' });
            }, 3500);
            return () => window.clearTimeout(id);
        }
    }, [state.votingStartFlg]);

    // 終了フラグの監視
    useEffect(() => {
        if (state.endFlg) {
            const id = window.setTimeout(() => {
                dispatch({ type: 'dismissEnd' });
            }, 3500);
            return () => window.clearTimeout(id);
        }
    }, [state.endFlg]);

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
        roomRemove,
        changeRadio,
        changeIcon,
        chat,
        init,
        draw,
        vote,
        changeLimitTime,
        limittimeDone,
        personCanpasMouseDown,
        personCanpasMouseUp,
    };
}
