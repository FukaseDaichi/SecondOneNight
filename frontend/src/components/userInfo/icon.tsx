import React from 'react';
import styles from '../../styles/components/userInfo/Icon.module.scss';
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

        // 制限時間ヘッダとの重なり修正
        const limitTimearea = document.getElementById('limit-time');

        if (circularnav.classList.contains(styles.closed)) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const pseudoBefore = window.getComputedStyle(
                document.querySelector('.' + styles.icon),
                ':before'
            ).animation;
            setIconList(shuffle(SystemConst.ICON_LIST, iconNum));

            if (limitTimearea) {
                setTimeout(
                    () => limitTimearea.classList.remove('position-static'),
                    200
                );
            }
        } else {
            if (limitTimearea) {
                limitTimearea.classList.add('position-static');
            }
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
