import React, { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { loadWobbleUpdater } from '@tsparticles/updater-wobble';
import { loadTiltUpdater } from '@tsparticles/updater-tilt';
import {
    buildSakuraOptions,
    DEFAULT_PALETTE,
    SakuraMode,
} from './sakuraParticlesOptions';

// エンジン初期化は全インスタンスで1回だけ
let enginePromise: Promise<void> | null = null;
const initEngine = (): Promise<void> => {
    if (!enginePromise) {
        enginePromise = initParticlesEngine(async (engine) => {
            await loadSlim(engine);
            await loadWobbleUpdater(engine);
            await loadTiltUpdater(engine);
        });
    }
    return enginePromise;
};

type Props = {
    mode: SakuraMode;
    palette?: string[];
};

// 桜(花びら)パーティクル。next/dynamic + ssr:false で読み込むこと
export default function SakuraParticles({ mode, palette }: Props) {
    const [ready, setReady] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const motionMq = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        );
        setReducedMotion(motionMq.matches);
        const onMotion = (e: MediaQueryListEvent) =>
            setReducedMotion(e.matches);
        motionMq.addEventListener('change', onMotion);

        setIsMobile(window.matchMedia('(max-width: 768px)').matches);

        initEngine().then(() => setReady(true));
        return () => motionMq.removeEventListener('change', onMotion);
    }, []);

    const options = useMemo(
        () => buildSakuraOptions(mode, palette ?? DEFAULT_PALETTE, isMobile),
        [mode, palette, isMobile]
    );

    if (!ready || reducedMotion) {
        return null;
    }

    return (
        <div
            aria-hidden="true"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
            }}
        >
            <Particles
                id={`sakura-${mode}`}
                options={options}
                style={{ position: 'absolute', inset: 0 }}
            />
        </div>
    );
}
