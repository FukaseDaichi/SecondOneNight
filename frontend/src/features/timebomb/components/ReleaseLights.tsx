import { TimeBombUser } from '../../../type';
import styles from '../../../styles/components/timebomb/room.module.scss';

type Props = {
    timeBombUserList: Array<TimeBombUser>;
    releaseNo: number;
};

export default function ReleaseLights({
    timeBombUserList,
    releaseNo,
}: Props) {
    return (
        <div className={`d-flex justify-content-center ${styles.light}`}>
            {timeBombUserList.map((value: TimeBombUser, index: number) => {
                return (
                    <div
                        key={index}
                        className={releaseNo > index ? styles.opend : ''}
                    >
                        <img src="/images/rightoff.png" alt="light" />
                        <img src="/images/righton.png" alt="light" />
                    </div>
                );
            })}
        </div>
    );
}
