import React from 'react';
import styles from '../../styles/components/card/holocard.module.scss';

type HoloCardProps = {
    width: number;
    height: number;
    imgUrl: string;
    borderRadius: number;
    rareFlg: boolean;
};

export default function HoloCard(props: HoloCardProps): JSX.Element {
    const cardStyle = {
        backgroundImage: `url(${props.imgUrl})`,
        width: `${props.width}px`,
        height: `${props.height}px`,
        borderRadius: `${props.borderRadius}px`,
    };
    return (
        <div className={styles.holocard}>
            <div
                className={`${styles.card} ${props.rareFlg ? styles.rare : ''}`}
                style={cardStyle}
            ></div>
        </div>
    );
}
