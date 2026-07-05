import Countdown from '../../../components/common/Countdown';
import Loadingdod from '../../../components/text/loadingdod';
import styles from '../../../styles/components/werewolf/room.module.scss';

type Props = {
    turn: number;
    limitTime: number;
    votingStartFlg: boolean;
    limittimeDone: () => void;
};

export default function TurnMessage({
    turn,
    limitTime,
    votingStartFlg,
    limittimeDone,
}: Props) {
    return (
        <>
            {turn === 1 && (
                <div className={styles.messagearea}>
                    <span className={styles.phasename}>
                        選択中 <Loadingdod color={'#f2fbfb'} />
                    </span>
                </div>
            )}
            {turn === 2 && (
                <div className={styles.messagearea}>
                    <span className={styles.phasename}>
                        議論中 <Loadingdod color={'#f2fbfb'} />
                    </span>
                    {limitTime > 0 && !votingStartFlg && (
                        <Countdown
                            timeLimit={limitTime}
                            limitDone={limittimeDone}
                            variant="night"
                            inline
                        />
                    )}
                    <button className={styles.endbtn} onClick={limittimeDone}>
                        議論終了
                    </button>
                </div>
            )}

            {turn === 3 && (
                <div className={styles.messagearea}>
                    <span className={styles.phasename}>
                        投票中 <Loadingdod color={'#f2fbfb'} />
                    </span>
                </div>
            )}
        </>
    );
}
