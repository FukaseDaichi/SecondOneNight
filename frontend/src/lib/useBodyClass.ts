import { useEffect } from 'react';

/**
 * active の間だけ body に className を付与する。
 * body クラス操作(モーダル時のスクロールロック等)をこのフックに閉じ込め、
 * コンポーネントからの document 直接操作をなくす。
 */
export function useBodyClass(className: string, active: boolean): void {
    useEffect(() => {
        if (!active) {
            return;
        }
        document.body.classList.add(className);
        return () => {
            document.body.classList.remove(className);
        };
    }, [className, active]);
}
