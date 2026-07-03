import React from 'react';
import styles from '../../styles/components/fakeartist/headInfo.module.scss';

type HeadInfoProps = {
    children: JSX.Element;
    bgc: string;
};

export default function HeaderInfo(props: HeadInfoProps): JSX.Element {
    return (
        <div className={styles.headerinfo}>
            <input
                type="checkbox"
                id={styles['menu-toggle']}
                className="fakeartistcheck"
            />
            <label id={styles.trigger} htmlFor={styles['menu-toggle']}></label>
            <label id={styles.burger} htmlFor={styles['menu-toggle']}></label>

            <div id={styles.menu} style={{ backgroundColor: props.bgc }}>
                <div className={styles.hidden}>{props.children}</div>
            </div>
        </div>
    );
}
