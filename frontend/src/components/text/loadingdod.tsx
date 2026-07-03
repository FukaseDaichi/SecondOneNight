import React from 'react';
import styles from '../../styles/components/text/loadingdod.module.scss';

type LoadingdodProps = {
    color: string;
};

export default function Loadingdod(props: LoadingdodProps) {
    return (
        <span className={styles.loadingdod}>
            <span style={{ color: props.color }}>●</span>
            <span style={{ color: props.color }}>●</span>
            <span style={{ color: props.color }}>●</span>
        </span>
    );
}
