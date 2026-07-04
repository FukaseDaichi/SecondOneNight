import styles from '../../../styles/components/timebomb/room.module.scss';

type Props = {
    limitTime: number;
    onChange: (time: number) => void;
};

export default function LimitTimeSelector({ limitTime, onChange }: Props) {
    return (
        <div className={styles.limittimeinputarea}>
            <div onClick={() => onChange(0)}>
                <input
                    type="radio"
                    id="limit-time-0"
                    name="limit-time"
                    value="0"
                    checked={limitTime === 0}
                    readOnly
                />
                <label htmlFor="limit-time-0">
                    <span>NONE</span>
                </label>
                <div className={styles.teban}>
                    <img src={'/images/hasami.png'} alt="手番" />
                </div>
            </div>
            <div onClick={() => onChange(180)}>
                <input
                    type="radio"
                    id="limit-time-180"
                    name="limit-time"
                    value="180"
                    checked={limitTime === 180}
                    readOnly
                />
                <label htmlFor="limit-time-180">
                    <span>3</span>min
                </label>
                <div className={styles.teban}>
                    <img src={'/images/hasami.png'} alt="手番" />
                </div>
            </div>
            <div onClick={() => onChange(300)}>
                <input
                    type="radio"
                    id="limit-time-300"
                    name="limit-time"
                    value="300"
                    checked={limitTime === 300}
                    readOnly
                />
                <label htmlFor="limit-time-300">
                    <span>5</span>min
                </label>
                <div className={styles.teban}>
                    <img src={'/images/hasami.png'} alt="手番" />
                </div>
            </div>
            <div onClick={() => onChange(420)}>
                <input
                    type="radio"
                    id="limit-time-420"
                    name="limit-time"
                    value="420"
                    checked={limitTime === 420}
                    readOnly
                />
                <label htmlFor="limit-time-420">
                    <span>7</span>min
                </label>
                <div className={styles.teban}>
                    <img src={'/images/hasami.png'} alt="手番" />
                </div>
            </div>
        </div>
    );
}
