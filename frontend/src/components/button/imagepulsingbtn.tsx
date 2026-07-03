import React from 'react';
import styles from '../../styles/components/button/imagepulsingbtn.module.scss';

type PulsingButtonProps = {
    imageUrl: string;
    imageWidth: number;
    value: string;
    onClickFnc: () => void;
    viewFlg: boolean;
};

export default function ImagePulsingBtn(
    props: PulsingButtonProps
): JSX.Element {
    const viewCass: string = props.viewFlg && styles.non_view;

    const btnStyle = {
        backgroundImage: `url(${props.imageUrl})`,
    };

    return (
        <div
            className={`${styles.container} ${viewCass}`}
            onClick={props.onClickFnc}
        >
            <span className={styles.pulse_button} style={btnStyle}>
                {props.value}
            </span>
        </div>
    );
}
