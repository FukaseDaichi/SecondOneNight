import styles from '../../../styles/components/werewolf/room.module.scss';

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
                <div onClick={() => changeLimitTime(300)}>
                    <input
                        type="radio"
                        id="limit-time-300"
                        name="limit-time"
                        value="300"
                        checked={limitTime === 300}
                        readOnly
                    />
                    <label htmlFor="limit-time-300">
                        <span>5</span>分
                    </label>
                    <div className={styles.teban}>
                        <img src={'/images/sunadokei_black.png'} alt="手番" />
                    </div>
                </div>
                <div onClick={() => changeLimitTime(420)}>
                    <input
                        type="radio"
                        id="limit-time-420"
                        name="limit-time"
                        value="420"
                        checked={limitTime === 420}
                        readOnly
                    />
                    <label htmlFor="limit-time-420">
                        <span>7</span>分
                    </label>
                    <div className={styles.teban}>
                        <img src={'/images/sunadokei_black.png'} alt="手番" />
                    </div>
                </div>
            </div>
        </div>
    );
}
