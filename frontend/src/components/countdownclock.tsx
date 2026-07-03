import React from 'react';
import styles from '../styles/components/countdownclock.module.scss';
import { useEffect, useState } from 'react';

type CountdownClockProps = {
    timeLimit: number; // 秒
    turn: number;
    limitDone: (pturn: number) => void;
};

export default function CountdownClock(
    props: CountdownClockProps
): JSX.Element {
    const [limitTime, setLimitTime] = useState(props.timeLimit);
    const [timer, setTimer] = useState(false);
    const [turn, setTurn] = useState(props.turn);

    if (turn !== props.turn) {
        setTurn(props.turn);
    }

    const countdown = () => {
        setLimitTime((prevLimitTime) => prevLimitTime - 1);
    };

    useEffect(() => {
        setTimer(true);
    }, []);

    useEffect(() => {
        if (timer) {
            const timerId = setInterval(countdown, 1000);
            return () => clearInterval(timerId);
        }
    }, [timer]);

    useEffect(() => {
        if (limitTime <= 0) {
            setTimer(false);
            props.limitDone(turn);
        }
    }, [limitTime]);

    useEffect(() => {
        if (turn !== 0) {
            setLimitTime(props.timeLimit);
            setTimer(true);
        }
    }, [turn]);

    return (
        <div className={styles.clock} id="limit-time">
            <div>
                LIMIT
                <img src="/images/sunadokei.png" alt="砂時計" />
                {Math.floor(limitTime / 60) > 0 && (
                    <span className={styles.min}>
                        <span>{Math.floor(limitTime / 60)}</span>min
                    </span>
                )}
                <span className={styles.sec}>
                    <span>
                        {limitTime % 60 < 10
                            ? '  ' + (limitTime % 60)
                            : limitTime % 60}
                    </span>
                    sec
                </span>
            </div>
        </div>
    );
}
