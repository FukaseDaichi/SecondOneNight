import styles from '../../../styles/components/timebomb/room.module.scss';

type Props = {
    secretFlg: boolean;
    onChange: () => void;
};

export default function SecretModeCheckbox({ secretFlg, onChange }: Props) {
    return (
        <div className={styles.checkboxarea}>
            <div className={styles.checkbox}>
                <input
                    id="seacret"
                    type="checkbox"
                    checked={secretFlg}
                    onChange={onChange}
                />
                <label htmlFor="seacret">SECRET MODE</label>
                <div className={styles.tooltiparea}>
                    <span
                        className={styles.tooltip}
                        data-tooltip="自分のカードの場所がわからなくなるモード"
                    >
                        ?
                    </span>
                </div>
            </div>
        </div>
    );
}
