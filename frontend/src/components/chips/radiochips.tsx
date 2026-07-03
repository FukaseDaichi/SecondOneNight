import React from 'react';
import styles from '../../styles/components/chips/radiochips.module.scss';

type RadiochipsProps = {
    checked: boolean;
    rabel: string;
    tooltip: string;
    onChangeFnc: () => void;
    id: string;
};
export default function RadioChips(props: RadiochipsProps): JSX.Element {
    return (
        <div className={styles.checkboxarea}>
            <div className={styles.checkbox}>
                <input
                    id={props.id}
                    type="checkbox"
                    checked={props.checked}
                    onChange={props.onChangeFnc}
                />
                <label htmlFor={props.id}>{props.rabel}</label>
                <div className={styles.tooltiparea}>
                    <span
                        className={styles.tooltip}
                        data-tooltip={props.tooltip}
                    >
                        ?
                    </span>
                </div>
            </div>
        </div>
    );
}
