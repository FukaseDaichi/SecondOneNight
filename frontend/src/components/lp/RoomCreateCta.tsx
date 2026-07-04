import React, { useState } from 'react';
import Router from 'next/router';
import { SystemConst } from '../../const/next.config';
import styles from '../../styles/lp.module.scss';

type Status = 'idle' | 'creating' | 'ready' | 'error';

type RoomCreateCtaProps = {
    /** ダーク背景(CTAセクション)用の白基調スタイル */
    invert?: boolean;
};

export default function RoomCreateCta({ invert = false }: RoomCreateCtaProps) {
    const [status, setStatus] = useState<Status>('idle');
    const [roomId, setRoomId] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [copied, setCopied] = useState(false);

    const roomUrl = roomId
        ? `${typeof window !== 'undefined' ? location.origin : ''}/werewolf/${roomId}`
        : '';

    const createRoom = async () => {
        if (status === 'creating') return;
        setStatus('creating');
        setCopied(false);
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
            setStatus('ready');
        } catch {
            setStatus('error');
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

    const rootCls = [styles.roomCta, invert ? styles.roomCtaInvert : '']
        .filter(Boolean)
        .join(' ');

    if (status === 'ready') {
        return (
            <div className={rootCls}>
                <p className={styles.roomCtaNote}>
                    部屋ができました。URLを参加者に伝えて入室してください。
                </p>
                {roomCode && (
                    <p className={styles.roomCtaNote}>
                        あいことば{' '}
                        <strong className={styles.roomCtaCode}>
                            {roomCode}
                        </strong>
                        (トップページの「あいことばで入室」から入れます)
                    </p>
                )}
                <p className={styles.roomCtaUrl}>{roomUrl}</p>
                <div className={styles.roomCtaActions}>
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
        );
    }

    return (
        <div className={rootCls}>
            <div className={styles.roomCtaActions}>
                <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={createRoom}
                    disabled={status === 'creating'}
                >
                    {status === 'creating'
                        ? '部屋を準備しています…'
                        : '今すぐ遊ぶ'}
                </button>
                <a href="#howto" className={styles.btnGhost}>
                    遊び方を見る
                </a>
            </div>
            {status === 'error' && (
                <p className={styles.roomCtaError}>
                    {SystemConst.Message.MSG_SYSTEMERR}
                    しばらくしてからもう一度お試しください。
                </p>
            )}
        </div>
    );
}
