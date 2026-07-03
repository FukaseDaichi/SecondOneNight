import React from 'react';
import styles from '../../styles/components/timebomb/headInfo.module.scss';

type HeadInfoProps = {
    releaseNo: number;
    userSize: number;
    limit: number;
};

const getBommer = (userSize: number) => {
    switch (userSize) {
        case 3:
            return (
                <p>
                    BOMMER <span>1</span>～<span>2</span>
                </p>
            );
        case 4:
            return (
                <p>
                    BOMMER <span>1</span>～<span>2</span>
                </p>
            );
        case 5:
            return (
                <p>
                    BOMMER <span>2</span>
                </p>
            );
        case 6:
            return (
                <p>
                    BOMMER <span>2</span>
                </p>
            );
        case 7:
            return (
                <p>
                    BOMMER <span>2</span>～<span>3</span>
                </p>
            );
        case 8:
            return (
                <p>
                    BOMMER <span>3</span>
                </p>
            );
    }
};

export default function Modal(props: HeadInfoProps): JSX.Element {
    return (
        <div className={styles.headerinfo}>
            <input type="checkbox" id={styles['menu-toggle']} />
            <label id={styles.trigger} htmlFor={styles['menu-toggle']}></label>
            <label id={styles.burger} htmlFor={styles['menu-toggle']}></label>

            <div id={styles.menu}>
                <div className={styles.view}></div>
                <div className={styles.hidden}>
                    <p>
                        TIMIE LIMIT <span>{props.limit}</span>turn
                    </p>
                    <p>
                        RELEASE <span>{props.releaseNo}</span>/
                        <span>{props.userSize}</span>
                    </p>
                    {getBommer(props.userSize)}
                </div>
            </div>
        </div>
    );
}
