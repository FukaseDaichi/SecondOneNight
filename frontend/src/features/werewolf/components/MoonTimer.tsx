import { useEffect, useId, useRef, useState } from 'react';
import styles from '../../../styles/components/werewolf/moontimer.module.scss';
import {
    formatTime,
    formatTimeSpoken,
    lerpColor,
    phaseProgress,
    warmth,
    TIMER_ROSE,
    TIMER_TEAL,
} from '../moonTimer';

type MoonTimerProps = {
    timeLimit: number; // 秒
    onDone: () => void;
};

const MOON_LIT = '#e9f5f4'; // 満月の淡色(mist 寄り)
const MOON_SHADOW = '#11282e'; // 欠けを作る影円

export default function MoonTimer({ timeLimit, onDone }: MoonTimerProps) {
    const [remaining, setRemaining] = useState(timeLimit);
    const endRef = useRef(0);
    const doneRef = useRef(false);
    const onDoneRef = useRef(onDone);
    onDoneRef.current = onDone;

    // clipPath id はインスタンスごとに一意化(複数描画時の DOM id 衝突を防ぐ)。
    const clipId = `moonClip-${useId().replace(/:/g, '')}`;

    // 終了時刻基準で残り時間を計算(setInterval の drift とタブ復帰ずれを防ぐ)。
    // 数字は 1 秒単位だが、月の欠け・色補間を滑らかに見せるため 200ms 間隔で更新する。
    useEffect(() => {
        endRef.current = performance.now() + timeLimit * 1000;
        doneRef.current = false;
        setRemaining(timeLimit);
        const id = setInterval(() => {
            const rem = (endRef.current - performance.now()) / 1000;
            setRemaining(rem);
            if (rem <= 0 && !doneRef.current) {
                doneRef.current = true;
                clearInterval(id);
                onDoneRef.current();
            }
        }, 200);
        return () => clearInterval(id);
    }, [timeLimit]);

    const p = phaseProgress(remaining, timeLimit);
    const t = warmth(remaining);
    const litColor = lerpColor(MOON_LIT, TIMER_ROSE, t);
    const digitColor = lerpColor('#f2fbfb', TIMER_ROSE, t);
    const ringColor = lerpColor(TIMER_TEAL, TIMER_ROSE, t);
    const shadowCx = 32 + 54 * p; // p=1で影が右外へ退避(満月)、p=0で中央(新月)
    const isFinal = remaining <= 10 && remaining > 0;
    const isBlood = t >= 0.5;
    const label = `残り ${formatTimeSpoken(remaining)}`;

    return (
        <div className={styles.moonTimer} role="timer" aria-label={label}>
            <svg
                className={`${styles.moon} ${isFinal ? styles.final : ''} ${
                    isBlood ? styles.blood : ''
                }`}
                width="44"
                height="44"
                viewBox="0 0 64 64"
                aria-hidden="true"
            >
                <defs>
                    <clipPath id={clipId}>
                        <circle cx="32" cy="32" r="26" />
                    </clipPath>
                </defs>
                <circle cx="32" cy="32" r="26" fill={litColor} />
                <circle
                    cx="24"
                    cy="26"
                    r="4"
                    fill="rgba(20, 47, 55, 0.1)"
                    clipPath={`url(#${clipId})`}
                />
                <circle
                    cx="38"
                    cy="36"
                    r="6"
                    fill="rgba(20, 47, 55, 0.08)"
                    clipPath={`url(#${clipId})`}
                />
                <circle
                    cx="30"
                    cy="42"
                    r="3"
                    fill="rgba(20, 47, 55, 0.08)"
                    clipPath={`url(#${clipId})`}
                />
                <circle
                    cx={shadowCx}
                    cy="32"
                    r="27"
                    fill={MOON_SHADOW}
                    clipPath={`url(#${clipId})`}
                />
                <circle
                    cx="32"
                    cy="32"
                    r="26.5"
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="1"
                    strokeOpacity="0.5"
                />
            </svg>
            <div className={styles.readout} aria-hidden="true">
                <span className={styles.eyebrow}>残り時間</span>
                <span className={styles.digits} style={{ color: digitColor }}>
                    {formatTime(remaining)}
                </span>
            </div>
        </div>
    );
}
