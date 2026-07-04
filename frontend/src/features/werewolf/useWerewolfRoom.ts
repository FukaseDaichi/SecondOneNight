import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { useGameSocket } from '../../lib/stomp/useGameSocket';
import Router from 'next/router';
import type { SocketInfo } from '../../type';
import type { WerewolfRoll } from '../../type/werewolf';
import { initialWerewolfState, werewolfReducer } from './reducer';

export function useWerewolfRoom(roomId: string | undefined) {
    const [state, dispatch] = useReducer(werewolfReducer, initialWerewolfState);

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

    const leaveRoom = useCallback(() => {
        if (!state.playerName) {
            return;
        }
        conect('/app/game-removeuser', buildInfo(130, state.playerName));
    }, [conect, buildInfo, state.playerName]);

    const removeUser = useCallback(
        (userName: string) => {
            conect('/app/game-removeuser', buildInfo(130, userName));
        },
        [conect, buildInfo]
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

    // 役職設定(state.counterMap から intList を生成。旧 DOM 読み取りの置換)
    const setRoll = useCallback(() => {
        const intList: Array<number> = [];
        state.staticRollList.forEach((element: WerewolfRoll) => {
            const rollsize = state.counterMap[element.rollNo] || 0;
            for (let i = 0; i < rollsize; i++) {
                intList.push(element.rollNo);
            }
        });
        conect('/app/werewolf-setrollregulation', buildInfo(150, intList));
    }, [conect, buildInfo, state.staticRollList, state.counterMap]);

    const setRollSet = useCallback(
        (rollNoList: Array<number>) => {
            conect('/app/werewolf-setrollregulation', buildInfo(150, rollNoList));
        },
        [conect, buildInfo]
    );

    const init = useCallback(() => {
        conect('/app/werewolf-init', buildInfo(300, null));
    }, [conect, buildInfo]);

    const selectRoll = useCallback(
        (rollIndex: number) => {
            conect('/app/werewolf-selectroll', buildInfo(400, rollIndex));
        },
        [conect, buildInfo]
    );

    const discussionAction = useCallback(
        (targetUsername: string) => {
            const stringList: Array<string> = [state.playerName as string, targetUsername];
            conect('/app/werewolf-discussionaction', buildInfo(500, stringList));
        },
        [conect, buildInfo, state.playerName]
    );

    const voting = useCallback(
        (targetUsername: string) => {
            conect('/app/werewolf-voting', buildInfo(700, targetUsername));
        },
        [conect, buildInfo]
    );

    const userAction = useCallback(
        (targetUsername: string) => {
            if (state.turn === 2) {
                discussionAction(targetUsername);
            } else if (state.turn === 3) {
                voting(targetUsername);
            }
        },
        [state.turn, discussionAction, voting]
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
    const counter = useCallback(
        (rollNo: number, delta: 1 | -1) => dispatch({ type: 'counter', rollNo, delta }),
        []
    );
    const setModalRoll = useCallback(
        (roll: WerewolfRoll | null) => dispatch({ type: 'setModalRoll', roll }),
        []
    );
    const setModalOwnFlg = useCallback(
        (value: boolean) => dispatch({ type: 'setModalOwnFlg', value }),
        []
    );
    const setRuleFlg = useCallback(
        (value: boolean) => dispatch({ type: 'setRuleFlg', value }),
        []
    );
    const setResultFlg = useCallback(
        (value: boolean) => dispatch({ type: 'setResultFlg', value }),
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

    // 投票フラグの監視: 4秒後に自動で下ろす
    useEffect(() => {
        if (state.votingStartFlg) {
            const id = window.setTimeout(
                () => dispatch({ type: 'setVotingStartFlg', value: false }),
                4000
            );
            return () => window.clearTimeout(id);
        }
    }, [state.votingStartFlg]);

    // 勝敗監視
    useEffect(() => {
        if (state.winteamList.length === 0) {
            dispatch({ type: 'setWinMessage', message: null });
        } else {
            const winnner: number = state.winteamList[0];
            let message: string | null = null;
            switch (winnner) {
                case 1:
                    message = '人狼陣営';
                    break;
                case 2:
                    message = '村人陣営';
                    break;
                case 3:
                    message = 'てるてる';
                    break;
            }

            const id = window.setTimeout(() => {
                scrollTo(0, 0);
                dispatch({ type: 'setWinMessage', message });
            }, 3000);
            return () => window.clearTimeout(id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.winteamList.length]);

    // 入室検知 + アイコン初期設定(classList 操作は entered の導出に置換)
    const own = state.userList.filter(
        (u) => u.userName === state.playerName
    )[0];
    const entered = !!own;

    // 退出検知: 一度入室した後に userList から消えたらトップへ戻す
    // (自分の退出ボタン・他プレイヤーからの退出操作の両方をここで拾う)
    const wasEntered = useRef(false);
    useEffect(() => {
        if (entered) {
            wasEntered.current = true;
        } else if (wasEntered.current) {
            Router.push('/');
        }
    }, [entered]);

    const iconInitialized = useRef(false);
    useEffect(() => {
        if (own && own.userIconUrl === null && !iconInitialized.current) {
            iconInitialized.current = true;
            changeIcon('/images/icon/icon' + own.userNo + '.jpg');
        }
    }, [own, changeIcon]);

    // 役職選択表示制御
    useEffect(() => {
        if (state.turn === 1) {
            dispatch({ type: 'setRollSelectTurnFlg', value: true });
        } else if (state.rollSelectTurnFlg && state.turn === 2) {
            const id = window.setTimeout(() => {
                dispatch({ type: 'setRollSelectTurnFlg', value: false });
            }, 4000);
            return () => window.clearTimeout(id);
        } else {
            dispatch({ type: 'setRollSelectTurnFlg', value: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.turn]);

    // 投票メッセージ(turn===3 で votingStartFlg を立てる)
    useEffect(() => {
        dispatch({ type: 'setVotingStartFlg', value: state.turn === 3 });
    }, [state.turn]);

    // カットイン: 4秒後に解除
    useEffect(() => {
        if (state.cutInNo > 0) {
            const id = window.setTimeout(() => dispatch({ type: 'clearCutIn' }), 4000);
            return () => window.clearTimeout(id);
        }
    }, [state.cutInNo]);

    // 銃声再生(独裁者/暗殺者アクションごとに snipeSeq が +1 される)
    useEffect(() => {
        if (state.snipeSeq === 0) {
            return;
        }
        const audio = new Audio('/se/snip.mp3');
        audio.play();
    }, [state.snipeSeq]);

    // チャット欄スクロール(現行 case 101 内の DOM 操作)
    useEffect(() => {
        const messageFirld = document.getElementById('chat-firld');
        if (messageFirld) {
            messageFirld.scrollTop = messageFirld.scrollHeight;
        }
    }, [state.chatList]);

    // プレイヤーアクション名(現行 L549-576 の純粋導出)
    const playerActionName = useMemo(() => {
        const playerData = state.playerData;
        if (playerData && playerData.roll) {
            if (
                state.turn === 2 &&
                playerData.roll.actionName &&
                playerData.roll.discussionActionCount < 1
            ) {
                if (playerData.roll.rollNo === 11) {
                    return null;
                }
                return playerData.roll.actionName;
            } else if (state.turn === 3) {
                if (
                    playerData.roll.votingAbleFlg &&
                    playerData.votingUserName === null
                ) {
                    return '投票';
                }
            }
        }
        return null;
    }, [state.playerData, state.turn]);

    const playerNPCActionName = useMemo(() => {
        const playerData = state.playerData;
        if (playerData && playerData.roll) {
            if (
                state.turn === 2 &&
                playerData.roll.actionName &&
                playerData.roll.discussionActionCount < 1
            ) {
                return playerData.roll.actionName;
            } else if (state.turn === 3) {
                if (
                    playerData.roll.votingAbleFlg &&
                    playerData.votingUserName === null
                ) {
                    return '投票';
                }
            }
        }
        return null;
    }, [state.playerData, state.turn]);

    return {
        state,
        connected,
        status,
        entered,
        roomIn,
        chat,
        changeIcon,
        leaveRoom,
        removeUser,
        setRoll,
        setRollSet,
        init,
        selectRoll,
        userAction,
        changeLimitTime,
        limittimeDone,
        voting,
        counter,
        setModalRoll,
        setModalOwnFlg,
        setRuleFlg,
        setResultFlg,
        playerActionName,
        playerNPCActionName,
    };
}
