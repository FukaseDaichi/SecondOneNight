import React, { useEffect, useState } from 'react';
import Router from 'next/router';
import { SystemConst } from '../../const/next.config';
import styles from '../../styles/lp.module.scss';

type CreateStatus = 'idle' | 'creating' | 'ready';

/**
 * PLAY NOWセクションの操作パネル。
 * 「部屋をつくる」と「あいことばで入室」を1枚のカードに集約し、
 * 2つのビュー(操作/作成結果)をグリッド重ねでクロスフェードする。
 * パネルの高さは常に大きいほうのビューで確保されるため、
 * 状態が変わっても周囲のコンテンツがガタつかない。
 */
export default function PlayNowPanel() {
    const [createStatus, setCreateStatus] = useState<CreateStatus>('idle');
    const [roomId, setRoomId] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [code, setCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [message, setMessage] = useState('');
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        setOrigin(location.origin);
    }, []);

    const roomUrl = roomId ? `${origin}/werewolf/${roomId}` : '';
    // 非表示の結果ビューにも実データと同じ長さのダミーを置き、
    // 作成前からパネルの高さを確保しておく(切替時のガタつき防止)
    const displayUrl =
        roomUrl || `${origin}/werewolf/00000000-0000-0000-0000-000000000000`;
    const displayCode = roomCode || '000000';

    const createRoom = async () => {
        if (createStatus === 'creating') return;
        setCreateStatus('creating');
        setMessage('');
        try {
            const res = await fetch(
                SystemConst.Server.AP_HOST +
                    SystemConst.Server.CREATE_ROOM +
                    '/werewolf'
            );
            if (!res.ok) throw new Error();
            const resJson = await res.json();
            setRoomId(resJson.roomId);
            setRoomCode(resJson.roomCode ?? '');
            setCopied(false);
            setCreateStatus('ready');
        } catch {
            setCreateStatus('idle');
            setMessage(
                SystemConst.Message.MSG_SYSTEMERR +
                    'しばらくしてからもう一度お試しください。'
            );
        }
    };

    const join = async () => {
        if (joining) return;
        if (!/^\d{6}$/.test(code)) {
            setMessage('6桁の数字を入力してください');
            return;
        }
        setJoining(true);
        setMessage('');
        try {
            const res = await fetch(
                SystemConst.Server.AP_HOST + 'roombycode/' + code
            );
            if (res.status === 404) {
                setMessage('部屋が見つかりません。番号を確認してください');
                return;
            }
            if (!res.ok) {
                throw new Error();
            }
            const resJson = await res.json();
            Router.push(`/werewolf/${resJson.roomId}`);
        } catch {
            setMessage(SystemConst.Message.MSG_SYSTEMERR);
        } finally {
            setJoining(false);
        }
    };

    const copyUrl = async () => {
        try {
            await navigator.clipboard.writeText(roomUrl);
            setCopied(true);
        } catch {
            // クリップボード非対応時はURL表示のみで手動コピーしてもらう
        }
    };

    const ready = createStatus === 'ready';

    return (
        <div className={styles.playPanel}>
            {/* 操作ビュー */}
            <div
                className={`${styles.playView} ${ready ? styles.playViewHidden : ''}`}
                aria-hidden={ready}
            >
                <button
                    type="button"
                    className={`${styles.btnPrimary} ${styles.playCreateBtn}`}
                    onClick={createRoom}
                    disabled={createStatus === 'creating'}
                >
                    {createStatus === 'creating'
                        ? '部屋を準備しています…'
                        : '今すぐ遊ぶ(部屋をつくる)'}
                </button>
                <div aria-hidden="true" className={styles.playDivider}>
                    または
                </div>
                <label className={styles.playJoinLabel} htmlFor="joincode">
                    あいことば(6桁)で入室
                </label>
                <div className={styles.playJoinRow}>
                    <input
                        id="joincode"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        enterKeyHint="go"
                        maxLength={6}
                        placeholder="000000"
                        value={code}
                        onChange={(e) =>
                            setCode(e.target.value.replace(/\D/g, ''))
                        }
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                join();
                            }
                        }}
                    />
                    <button type="button" onClick={join} disabled={joining}>
                        {joining ? '確認中…' : '入室'}
                    </button>
                </div>
                <p className={styles.playMessage} role="status">
                    {message}
                </p>
            </div>

            {/* 作成結果ビュー */}
            <div
                className={`${styles.playView} ${ready ? '' : styles.playViewHidden}`}
                aria-hidden={!ready}
            >
                <p className={styles.playReadyTitle}>部屋ができました</p>
                <p className={styles.playReadyNote}>
                    URLを参加者に伝えて入室してください。
                </p>
                {(!ready || roomCode) && (
                    <div className={styles.playCodeBox}>
                        <span>あいことば</span>
                        <strong>{displayCode}</strong>
                    </div>
                )}
                <p className={styles.playUrl}>{displayUrl}</p>
                <div className={styles.playActions}>
                    <button
                        type="button"
                        className={styles.btnGhost}
                        onClick={copyUrl}
                    >
                        {copied ? 'コピーしました' : 'URLをコピー'}
                    </button>
                    <button
                        type="button"
                        className={styles.btnPrimary}
                        onClick={() => Router.push(`/werewolf/${roomId}`)}
                    >
                        入室する
                    </button>
                </div>
            </div>
        </div>
    );
}
