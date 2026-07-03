/*
Copyright (c) Abhi
Released under the MIT license
https://codepen.io/AbhiPatel18/pen/NBgZVK
*/
import React from 'react';
import styles from '../styles/components/house.module.scss';

export default function House(): JSX.Element {
    return (
        <div className={styles.house}>
            <div className={styles.container}>
                <div className={styles.chimney}>
                    <div className={styles.cTop}>
                        <div className={styles.vapour}></div>
                        <div className={styles.vapour}></div>
                        <div className={styles.vapour}></div>
                        <div className={styles.vapour}></div>
                        <div className={styles.vapour}></div>
                    </div>
                    <div className={styles.cBot}></div>
                </div>
                <div className={styles.ceils}>
                    <div className={styles.ceiling}>
                        <div className={styles.cover}></div>
                    </div>
                    <div className={styles.ceiling}>
                        <div className={styles.cover}></div>
                    </div>
                </div>
                <div className={styles.body}>
                    <div className={styles.top}>
                        <div className={styles.h}></div>
                        <div className={styles.v}></div>
                    </div>
                    <div className={styles.door}>
                        <div className={styles.knob}></div>
                    </div>
                    <div className={styles.window}>
                        <div className={styles.h}></div>
                        <div className={styles.v}></div>
                        <div className={styles.support}></div>
                    </div>
                </div>
                <div className={styles.floor}></div>
                <div className={styles.tree}>
                    <div className={styles.main}>
                        <div className={styles.branch}></div>
                        <div className={styles.branch}></div>
                    </div>
                    <div className={styles.stem}></div>
                </div>
                <div className={styles.ground}></div>
            </div>
        </div>
    );
}
