import React from 'react';
import styles from '../../../styles/components/werewolf/bullethole.module.scss';

// 銃痕: 中央の弾痕 + 放射状のひび割れ。種明かしと結果モーダルで共用
export default function BulletHole({ small }: { small?: boolean }) {
    return (
        <svg
            viewBox="0 0 100 100"
            className={`${styles.bullethole} ${small ? styles.small : ''}`}
            aria-hidden="true"
        >
            <g
                stroke="rgba(16, 20, 22, 0.9)"
                strokeWidth="2.4"
                strokeLinecap="round"
            >
                <line x1="50" y1="50" x2="10" y2="38" />
                <line x1="50" y1="50" x2="22" y2="14" />
                <line x1="50" y1="50" x2="58" y2="6" />
                <line x1="50" y1="50" x2="88" y2="26" />
                <line x1="50" y1="50" x2="94" y2="58" />
                <line x1="50" y1="50" x2="74" y2="88" />
                <line x1="50" y1="50" x2="38" y2="92" />
                <line x1="50" y1="50" x2="8" y2="70" />
            </g>
            <g
                stroke="rgba(242, 251, 251, 0.4)"
                strokeWidth="1"
                strokeLinecap="round"
            >
                <line x1="50" y1="50" x2="16" y2="30" />
                <line x1="50" y1="50" x2="66" y2="10" />
                <line x1="50" y1="50" x2="90" y2="44" />
                <line x1="50" y1="50" x2="58" y2="90" />
                <line x1="50" y1="50" x2="14" y2="78" />
            </g>
            <circle cx="50" cy="50" r="16" fill="rgba(16, 20, 22, 0.95)" />
            <circle cx="50" cy="50" r="10" fill="#000" />
            <circle
                cx="50"
                cy="50"
                r="16.5"
                fill="none"
                stroke="rgba(120, 128, 132, 0.7)"
                strokeWidth="2"
            />
        </svg>
    );
}
