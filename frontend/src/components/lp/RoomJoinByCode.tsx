import React, { useState } from 'react';
import Router from 'next/router';
import { SystemConst } from '../../const/next.config';
import styles from '../../styles/lp.module.scss';

type Props = {
    /** ダーク背景(CTAセクション)用の白基調スタイル */
    invert?: boolean;
};

export default function RoomJoinByCode({ invert = false }: Props) {
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [joining, setJoining] = useState(false);

    const join = async () => {
        if (!/^\d{6}$/.test(code) || joining) {
            setError('6桁の数字を入力してください');
            return;
        }
        setJoining(true);
        setError(null);
        try {
            const res = await fetch(
                SystemConst.Server.AP_HOST + 'roombycode/' + code
            );
            if (res.status === 404) {
                setError('部屋が見つかりません。番号を確認してください');
                return;
            }
            if (!res.ok) {
                throw new Error();
            }
            const resJson = await res.json();
            Router.push(`/werewolf/${resJson.roomId}`);
        } catch {
            setError(SystemConst.Message.MSG_SYSTEMERR);
        } finally {
            setJoining(false);
        }
    };

    const rootCls = [styles.joinCode, invert ? styles.joinCodeInvert : '']
        .filter(Boolean)
        .join(' ');

    return (
        <div className={rootCls}>
            <label htmlFor={invert ? 'joincode-cta' : 'joincode-hero'}>
                あいことば(6桁)で入室
            </label>
            <div className={styles.joinCodeRow}>
                <input
                    id={invert ? 'joincode-cta' : 'joincode-hero'}
                    type="text"
                    inputMode="numeric"
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
            {error && <p className={styles.joinCodeError}>{error}</p>}
        </div>
    );
}
