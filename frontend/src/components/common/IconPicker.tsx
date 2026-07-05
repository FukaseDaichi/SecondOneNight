import React, { useEffect, useRef, useState } from 'react';
import styles from '../../styles/components/common/iconpicker.module.scss';
import { SystemConst } from '../../const/next.config';
import { imageToIconDataUrl } from '../../lib/imageToIconDataUrl';

const ICON_NUM = 6;

const shuffle = ([...array]: string[], sliceNum: number) => {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.slice(0, sliceNum);
};

type IconPickerProps = {
    mainIconSrc: string;
    changeIcon: (src: string) => void;
};

export default function IconPicker(props: IconPickerProps) {
    const [open, setOpen] = useState(false);
    const [iconList, setIconList] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [shiftX, setShiftX] = useState(0);
    const rootRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIconList(shuffle(SystemConst.ICON_LIST, ICON_NUM));
    }, []);

    // 画面端のカードでもポップオーバーがビューポートからはみ出さないよう補正する
    useEffect(() => {
        if (!open) {
            setShiftX(0);
            return;
        }
        const el = popoverRef.current;
        if (!el) {
            return;
        }
        const margin = 8;
        const rect = el.getBoundingClientRect();
        if (rect.left < margin) {
            setShiftX(margin - rect.left);
        } else if (rect.right > window.innerWidth - margin) {
            setShiftX(window.innerWidth - margin - rect.right);
        }
    }, [open]);

    useEffect(() => {
        if (!open) {
            return;
        }
        const onPointerDown = (e: MouseEvent | TouchEvent) => {
            if (
                rootRef.current &&
                !rootRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('touchstart', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('touchstart', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    const selectIcon = (value: string) => {
        props.changeIcon(`/images/icon/${value}`);
        setError(null);
        setOpen(false);
    };

    const handleIconFile = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) {
            return;
        }
        try {
            const dataUrl = await imageToIconDataUrl(file);
            setError(null);
            props.changeIcon(dataUrl);
            setOpen(false);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : '画像を変換できませんでした'
            );
        }
    };

    return (
        <div className={styles.picker} ref={rootRef}>
            <button
                type="button"
                className={styles.avatar}
                aria-label="アイコンを変更"
                aria-expanded={open}
                onClick={() => setOpen((prev) => !prev)}
            >
                <img src={props.mainIconSrc} alt="アイコン" />
            </button>
            <span className={styles.editbadge} aria-hidden="true">
                ✎
            </span>
            {open && (
                <div
                    className={styles.popover}
                    ref={popoverRef}
                    style={{
                        transform: `translateX(calc(-50% + ${shiftX}px))`,
                    }}
                    role="dialog"
                    aria-label="アイコン選択"
                >
                    <div className={styles.grid}>
                        {iconList.map((value) => (
                            <button
                                type="button"
                                key={value}
                                className={styles.choice}
                                onClick={() => selectIcon(value)}
                            >
                                <img
                                    src={`/images/icon/${value}`}
                                    alt="選択アイコン"
                                />
                            </button>
                        ))}
                    </div>
                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.shuffle}
                            onClick={() =>
                                setIconList(
                                    shuffle(SystemConst.ICON_LIST, ICON_NUM)
                                )
                            }
                        >
                            シャッフル
                        </button>
                        <label className={styles.uploadtile}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleIconFile}
                            />
                            写真をアップロード
                        </label>
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                </div>
            )}
        </div>
    );
}
