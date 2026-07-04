import React from 'react';
import styles from '../../../styles/components/fakeartist/room.module.scss';

type Props = {
    limitTime: number;
    changeLimitTime: (time: number) => void;
};

export default function LimitTimeSelector({
    limitTime,
    changeLimitTime,
}: Props) {
    return (
        <div className={styles.rollselect}>
            <div className={styles.title}>議論中の制限時間</div>

            <div className={styles.limittimeinputarea}>
                <div onClick={() => changeLimitTime(0)}>
                    <input
                        type="radio"
                        id="limit-time-0"
                        name="limit-time"
                        value="0"
                        checked={limitTime === 0}
                        readOnly
                    />
                    <label htmlFor="limit-time-0">
                        <span>なし</span>
                    </label>
                    <div className={styles.teban}>
                        <img src={'/images/sunadokei_black.png'} alt="手番" />
                    </div>
                </div>
                <div onClick={() => changeLimitTime(60)}>
                    <input
                        type="radio"
                        id="limit-time-60"
                        name="limit-time"
                        value="60"
                        checked={limitTime === 60}
                        readOnly
                    />
                    <label htmlFor="limit-time-60">
                        <span>1</span>分
                    </label>
                    <div className={styles.teban}>
                        <img src={'/images/sunadokei_black.png'} alt="手番" />
                    </div>
                </div>
                <div onClick={() => changeLimitTime(120)}>
                    <input
                        type="radio"
                        id="limit-time-120"
                        name="limit-time"
                        value="120"
                        checked={limitTime === 120}
                        readOnly
                    />
                    <label htmlFor="limit-time-120">
                        <span>2</span>分
                    </label>
                    <div className={styles.teban}>
                        <img src={'/images/sunadokei_black.png'} alt="手番" />
                    </div>
                </div>
                <div onClick={() => changeLimitTime(180)}>
                    <input
                        type="radio"
                        id="limit-time-180"
                        name="limit-time"
                        value="180"
                        checked={limitTime === 180}
                        readOnly
                    />
                    <label htmlFor="limit-time-180">
                        <span>3</span>分
                    </label>
                    <div className={styles.teban}>
                        <img src={'/images/sunadokei_black.png'} alt="手番" />
                    </div>
                </div>
            </div>
        </div>
    );
}
