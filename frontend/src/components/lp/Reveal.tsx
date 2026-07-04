import React from 'react';
import styles from '../../styles/lp.module.scss';
import useReveal from './useReveal';

type RevealProps = {
    delay?: string;
    className?: string;
    children: React.ReactNode;
};

export default function Reveal({ delay, className, children }: RevealProps) {
    const [ref, revealed] = useReveal<HTMLDivElement>();
    const cls = [styles.reveal, revealed ? styles.revealed : '', className]
        .filter(Boolean)
        .join(' ');
    return (
        <div
            ref={ref}
            className={cls}
            style={delay ? { transitionDelay: delay } : undefined}
        >
            {children}
        </div>
    );
}
