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
                    選択中 <Loadingdod color={'#f2fbfb'} />
                </div>
            )}
            {turn === 2 && (
                <div className={styles.messagearea}>
                    {limitTime > 0 && !votingStartFlg && (
                        <Countdown
                            timeLimit={limitTime}
                            limitDone={limittimeDone}
                        />
                    )}
                    議論中 <Loadingdod color={'#f2fbfb'} />　
                    <button className={styles.endbtn} onClick={limittimeDone}>
                        議論終了
                    </button>
                </div>
            )}

            {turn === 3 && (
                <div className={styles.messagearea}>
                    投票中 <Loadingdod color={'#f2fbfb'} />
                </div>
            )}
        </>
    );
}
