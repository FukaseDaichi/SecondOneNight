import React from 'react';
import styles from '../../styles/components/werewolf/cutin.module.scss';

type CutInProps = {
    rollNo: number;
};

export default function CutIn(props: CutInProps): JSX.Element {
    return (
        <div className={styles.cutin}>
            <div>
                <div>
                    <img src="/images/werewolf/cutin.png" alt="カットイン" />
                    <img
                        src={'/images/werewolf/roll/' + props.rollNo + '.jpg'}
                        alt="役職"
                    />
                </div>
            </div>
        </div>
    );
}
