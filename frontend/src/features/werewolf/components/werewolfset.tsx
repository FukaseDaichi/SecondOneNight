import React from 'react';
import styles from '../../../styles/components/werewolf/werewolfset.module.scss';
import Data from '../../../const/json/werewolf.json';

type WerewolfSetProps = {
    userSize: number;
    changeFnc: (rollNoList: Array<number>) => void;
};

// おすすめ役職セットのセレクタ。選択すると即座に役職構成を送信する
export default function WerewolfSet(props: WerewolfSetProps) {
    const presets = Data[String(props.userSize)];
    const viewFlg = presets && presets.length > 0;

    return (
        <div className={`${styles.werewolfset} ${!viewFlg && styles.none}`}>
            <select
                onChange={(e) => {
                    const value = Number(e.target.value);
                    props.changeFnc(presets[value].rollNoList);
                }}
                aria-label="おすすめ役職セット"
                defaultValue="-1"
            >
                <option disabled value={-1}>
                    {viewFlg
                        ? 'おすすめ役職セット'
                        : 'おすすめセットはありません'}
                </option>
                {viewFlg &&
                    presets.map((element, index) => {
                        return (
                            <option value={index} key={index}>
                                {element.title}
                            </option>
                        );
                    })}
            </select>
        </div>
    );
}
