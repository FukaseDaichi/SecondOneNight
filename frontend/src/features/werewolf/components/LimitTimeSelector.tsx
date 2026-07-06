import styles from '../../../styles/components/werewolf/menupanel.module.scss';

type Props = {
    limitTime: number;
    changeLimitTime: (time: number) => void;
};

const OPTIONS: Array<{ value: number; label: string }> = [
    { value: 0, label: 'なし' },
    { value: 180, label: '3分' },
    { value: 300, label: '5分' },
    { value: 420, label: '7分' },
];

// 議論制限時間のピル選択(送信値は従来どおり秒数)
export default function LimitTimeSelector({
    limitTime,
    changeLimitTime,
}: Props) {
    return (
        <div>
            <p className={styles.timeLabel}>議論中の制限時間</p>
            <div
                className={styles.timePills}
                role="radiogroup"
                aria-label="議論中の制限時間"
            >
                {OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        role="radio"
                        aria-checked={limitTime === option.value}
                        className={`${styles.timePill} ${
                            limitTime === option.value ? styles.selected : ''
                        }`}
                        onClick={() => changeLimitTime(option.value)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
