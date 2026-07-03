import React from 'react';
import styles from '../../styles/components/button/animationbtn.module.scss';

type AnimeButtonProps = {
    value: string;
    onClickFnc: () => void;
    viewFlg: boolean;
    animeClass: string;
};
export default function AnimationBtn(props: AnimeButtonProps): JSX.Element {
    const viewCass: string = props.viewFlg ? '' : styles.non;

    return (
        <div
            className={`${styles.container} ${viewCass}`}
            onClick={props.onClickFnc}
        >
            <span
                className={`${styles.anime_button} ${styles[props.animeClass]}`}
            >
                {props.value}
            </span>
        </div>
    );
}
