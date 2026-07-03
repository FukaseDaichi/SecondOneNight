import React from 'react';
import styles from '../../styles/components/werewolf/werewolfset.module.scss';
import Data from '../../const/json/werewolf.json';

type WerewolfSetProps = {
    userSize: number;
    changeFnc: (Array) => void;
};

export default function WerewolfSet(props: WerewolfSetProps): JSX.Element {
    const viewFlg = Data[props.userSize] && Data[props.userSize].length > 0;

    return (
        <div className={`${styles.werewolfset} ${!viewFlg && styles.none}`}>
            <select
                onChange={() => {
                    const dom = document.getElementById(
                        'werewolfset'
                    ) as HTMLInputElement;
                    const value = Number(dom.value);
                    props.changeFnc(
                        Data[String(props.userSize)][value].rollNoList
                    );
                }}
                id="werewolfset"
                defaultValue="-1"
            >
                <option disabled value={-1}>
                    {Data[String(props.userSize)]
                        ? 'おすすめ役職セット'
                        : 'おすすめセットはありません'}
                </option>
                {Data[String(props.userSize)] &&
                    Data[String(props.userSize)].map((element, index) => {
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
