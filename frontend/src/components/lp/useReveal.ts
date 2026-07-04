import { RefObject, useEffect, useRef, useState } from 'react';

/**
 * 要素が viewport に入ったら revealed=true を返すフック。
 * prefers-reduced-motion 時と IntersectionObserver 非対応時は即時表示。
 */
export default function useReveal<T extends HTMLElement>(): [
    RefObject<T | null>,
    boolean,
] {
    const ref = useRef<T>(null);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (
            typeof IntersectionObserver === 'undefined' ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            setRevealed(true);
            return;
        }
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setRevealed(true);
                        io.disconnect();
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return [ref, revealed];
}
