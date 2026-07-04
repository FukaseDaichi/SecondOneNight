import Modal from '../../../components/modal';
import styles from '../../../styles/components/timebomb/room.module.scss';

type Props = {
    roundMessageFlg: boolean;
    round: number;
    bommerFlg: boolean;
    policeFlg: boolean;
};

export default function ResultModals({
    roundMessageFlg,
    round,
    bommerFlg,
    policeFlg,
}: Props) {
    return (
        <>
            {roundMessageFlg && (
                <Modal type="one">
                    <div
                        className={styles.roundMessage}
                        data-text={`Round${round}`}
                    >
                        {round <= 3 ? `ROUND${round}` : 'FINAL'}
                    </div>
                </Modal>
            )}

            {bommerFlg && (
                <Modal type={'seven'}>
                    <div className={styles.result}>
                        <img src="/images/failed.png" alt="結果" />
                    </div>
                </Modal>
            )}

            {policeFlg && (
                <Modal type={'five'}>
                    <div className={styles.result}>
                        <img src="/images/success.png" alt="結果" />
                    </div>
                </Modal>
            )}
        </>
    );
}
