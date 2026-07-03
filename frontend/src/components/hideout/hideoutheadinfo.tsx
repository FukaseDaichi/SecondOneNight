/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import styles from '../../styles/components/hideout/headinfo.module.scss';

type HeadInfoProps = {
    userList: Array<any>;
    memberCardList: Array<any>;
};

export default function HideoutHeadInfo(props: HeadInfoProps): JSX.Element {
    const terroristRollNum: number = props.userList.filter((element) => {
        return element.userRoleNo === 2;
    }).length;

    let extero = 0;
    let tero = 0;
    let swat = 0;
    let exswat = 0;

    let exteroSize = 0;
    let teroSize = 0;
    let swatSize = 0;
    let exswatSize = 0;

    props.memberCardList.forEach((element) => {
        switch (element.cardType) {
            case -1:
                exswatSize++;
                if (!element.consumeFlg) {
                    exswat++;
                }
                break;
            case 0:
                swatSize++;
                if (!element.consumeFlg) {
                    swat++;
                }
                break;
            case 1:
                teroSize++;
                if (!element.consumeFlg) {
                    tero++;
                }
                break;
            case 2:
                exteroSize++;
                if (!element.consumeFlg) {
                    extero++;
                }
                break;
        }
    });

    return (
        <div className={styles.headerinfo}>
            <input type="checkbox" id={styles['menu-toggle']} />
            <label id={styles.trigger} htmlFor={styles['menu-toggle']}></label>
            <label id={styles.burger} htmlFor={styles['menu-toggle']}></label>

            <div id={styles.menu}>
                <div className={styles.view}></div>
                <div className={styles.hidden}>
                    <div className={styles.roll}>
                        <div>
                            <img
                                src="/images/hideout/terrorist.png"
                                alt="テロリスト"
                            />
                        </div>{' '}
                        <h2>TERRORIST</h2>
                        <h2>× {terroristRollNum}</h2>
                    </div>
                    <div className={styles.member}>
                        <div>
                            <div>
                                <div>
                                    <img
                                        src="/images/hideout/swatcard.png"
                                        alt="スワット"
                                    />
                                </div>
                                <span>{swat}</span>/{swatSize}
                            </div>
                            <div>
                                <div>
                                    <img
                                        src="/images/hideout/exswatcard.png"
                                        alt="エキスパートスワット"
                                    />
                                </div>
                                <span>{exswat}</span>/{exswatSize}
                            </div>
                            <div>
                                <div>
                                    <img
                                        src="/images/hideout/terroristcard.png"
                                        alt="テロリスト"
                                    />
                                </div>
                                <span>{tero}</span>/{teroSize}
                            </div>
                            <div>
                                <div>
                                    <img
                                        src="/images/hideout/exterroristcard.png"
                                        alt="エキスパートテロリスト"
                                    />
                                </div>
                                <span>{extero}</span>/{exteroSize}
                            </div>
                        </div>
                        <h2>total {tero + extero + swat + exswat} left</h2>
                    </div>
                </div>
            </div>
        </div>
    );
}
