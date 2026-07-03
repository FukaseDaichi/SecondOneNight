import React from 'react';
import styles from '../../styles/components/werewolf/countdown.module.scss';
import { useEffect, useState } from 'react';

type CountdownProps = {
    timeLimit: number; // 秒
    limitDone: () => void;
};

export default function Countdown(props: CountdownProps): JSX.Element {
    const [limitTime, setLimitTime] = useState(props.timeLimit);
    const [timer, setTimer] = useState(false);

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
            props.limitDone();
        }
    }, [limitTime]);

    return (
        <div className={styles.clock} id="limit-time">
            <div>
                残り時間
                <img src="/images/sunadokei_black.png" alt="砂時計" />
                {Math.floor(limitTime / 60) > 0 && (
                    <span className={styles.min}>
                        <span>{Math.floor(limitTime / 60)}</span>分
                    </span>
                )}
                <span className={styles.sec}>
                    <span>
                        {limitTime % 60 < 10
                            ? '  ' + (limitTime % 60)
                            : limitTime % 60}
                    </span>
                    秒
                </span>
            </div>
        </div>
    );
}
