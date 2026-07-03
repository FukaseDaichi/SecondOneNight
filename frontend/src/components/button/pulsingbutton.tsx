import React from 'react';
import styles from '../../styles/components/button/pulsingbutton.module.scss';

type PulsingButtonProps = {
    value: string;
    onClickFnc: () => void;
    viewFlg: boolean;
};
export default function PulsingButton(props: PulsingButtonProps): JSX.Element {
    const viewCass: string = props.viewFlg && styles.non_view;
    return (
        <div
            className={`${styles.container} ${viewCass}`}
            onClick={props.onClickFnc}
        >
            <span className={styles.pulse_button}>{props.value}</span>
        </div>
    );
}
