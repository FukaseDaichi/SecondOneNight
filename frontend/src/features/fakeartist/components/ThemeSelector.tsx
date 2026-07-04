import React from 'react';
import styles from '../../../styles/components/fakeartist/room.module.scss';
import RadioChips from '../../../components/chips/radiochips';

type Props = {
    patternList: Array<number>;
    changeRadio: (patternNo: number) => void;
};

export default function ThemeSelector({ patternList, changeRadio }: Props) {
    return (
        <div className={styles.theme}>
            <div className={styles.title}>テーマの種類</div>
            <div className={styles.pattern}>
                <RadioChips
                    id="theme_5"
                    onChangeFnc={() => changeRadio(5)}
                    checked={patternList.includes(5)}
                    tooltip={'食べ物のテーマを含む'}
                    rabel="食べ物"
                />
                <RadioChips
                    id="theme_4"
                    onChangeFnc={() => changeRadio(4)}
                    checked={patternList.includes(4)}
                    tooltip={'人の形をしたテーマを含む'}
                    rabel="人の形"
                />
                <RadioChips
                    id="theme_1"
                    onChangeFnc={() => changeRadio(1)}
                    checked={patternList.includes(1)}
                    tooltip={'おとぎ話のテーマを含む'}
                    rabel="おとぎ話"
                />
                <RadioChips
                    id="theme_2"
                    onChangeFnc={() => changeRadio(2)}
                    checked={patternList.includes(2)}
                    tooltip={'動物のテーマを含む'}
                    rabel="動物"
                />
                <RadioChips
                    id="theme_3"
                    onChangeFnc={() => changeRadio(3)}
                    checked={patternList.includes(3)}
                    tooltip={'スポーツのテーマを含む'}
                    rabel="スポーツ"
                />
            </div>
        </div>
    );
}
