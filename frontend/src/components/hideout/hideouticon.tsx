import React from 'react';
import styles from '../../styles/components/hideout/hideouticon.module.scss';
import { useState, useEffect } from 'react';
import { SystemConst } from '../../const/next.config';

const shuffle = ([...array], sliceNum: number) => {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.slice(0, sliceNum);
};

type IconProps = {
    mainIconSrc: string;
    changeIcon: (src: string) => void;
};

export default function Icon(props: IconProps): JSX.Element {
    const iconNum = 6;
    const [iconList, setIconList] = useState([]);
    useEffect(() => {
        setIconList(shuffle(SystemConst.ICON_LIST, iconNum));
    }, []);

    const deployment = () => {
        const circularnav = document.querySelector(
            '.' + styles.icon
        ) as HTMLElement;
        circularnav.classList.toggle(styles.closed);
        circularnav.classList.toggle(styles.clicked);

        if (circularnav.classList.contains(styles.closed)) {
            window.getComputedStyle(
                document.querySelector('.' + styles.icon),
                ':before'
            ).animation;
            setIconList(shuffle(SystemConst.ICON_LIST, iconNum));
        }
    };

    const iconSelect = (e) => {
        const iconUrl = e.target.src;
        if (iconUrl) {
            props.changeIcon(iconUrl);
        }
    };

    return (
        <div className={`${styles.icon} ${styles.closed}`} onClick={deployment}>
            <div className={styles.mainicon}>
                <img src={props.mainIconSrc} alt="アイコン" />
            </div>
            {iconList.map((value: string, index: number) => {
                return (
                    <div
                        className={styles.subicon}
                        key={index}
                        onClick={(e) => {
                            iconSelect(e);
                        }}
                    >
                        <img src={`/images/icon/${value}`} alt="選択アイコン" />
                    </div>
                );
            })}
        </div>
    );
}
