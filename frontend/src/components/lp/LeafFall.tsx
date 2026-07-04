import React from 'react';
import styles from '../../styles/lp.module.scss';

const PALETTE = ['#E88F94', '#E9A7BE', '#F3B9BC', '#8FD0D6'];

// デザイン由来の決定的擬似乱数(Math.random だと hydration がズレる)
const rand = (i: number, n: number): number => {
    const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
    return x - Math.floor(x);
};

export default function LeafFall({ count = 9 }: { count?: number }) {
    const leaves = Array.from({ length: count }, (_, i) => {
        const size = 9 + rand(i, 1) * 14;
        return {
            left: `${3 + rand(i, 2) * 94}%`,
            width: `${size}px`,
            height: `${size}px`,
            background: PALETTE[i % PALETTE.length],
            animationDuration: `${13 + rand(i, 3) * 11}s`,
            animationDelay: `${-rand(i, 4) * 24}s`,
        };
    });
    return (
        <div className={styles.leaves} aria-hidden="true">
            {leaves.map((style, i) => (
                <span key={i} className={styles.leaf} style={style} />
            ))}
        </div>
    );
}
