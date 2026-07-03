import React from 'react';
import styles from '../../styles/components/modal/hideoutmodal.module.scss';
import { useEffect } from 'react';

const view = (value: string) => {
    document.getElementById(styles.modal_container).removeAttribute('class');
    document
        .getElementById(styles.modal_container)
        .classList.add(styles[value]);
    document.querySelector('body').classList.add(styles.modal_active);
};

type HideoutModalProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: any;
    type: string;
    endFnc: () => void;
};

export default function HideoutModal(props: HideoutModalProps): JSX.Element {
    const modalClick = () => {
        document.querySelector('body').classList.remove('modal_active');
        document
            .getElementById(styles.modal_container)
            .classList.add(styles.out);
        props.endFnc();
    };

    useEffect(() => {
        view(props.type);
        return modalClick;
    }, []);

    return (
        <div className={styles.modal}>
            <div id={styles.modal_container} onClick={modalClick}>
                <div className={styles.modal_background}>
                    <div className={styles.modal}>{props.children}</div>
                </div>
            </div>
        </div>
    );
}
