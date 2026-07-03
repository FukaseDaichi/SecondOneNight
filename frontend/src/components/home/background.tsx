import { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';

export default function Background() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => setReady(true));
    }, []);

    const options = useMemo<ISourceOptions>(
        () => ({
            fullScreen: { enable: true, zIndex: 0 },
            particles: {
                number: { value: 50, density: { enable: true } },
                color: { value: '#ffffff' },
                shape: { type: 'circle' },
                stroke: { width: 0.9, color: '#d2b356' },
                opacity: { value: { min: 0.1, max: 0.5 } },
                size: { value: { min: 0.1, max: 10 } },
                links: { enable: false },
                move: {
                    enable: true,
                    speed: 5,
                    direction: 'bottom',
                    random: true,
                    straight: false,
                    outModes: { default: 'out' },
                },
            },
            interactivity: {
                detectsOn: 'canvas',
                events: {
                    onHover: { enable: true, mode: 'bubble' },
                    onClick: { enable: true, mode: 'repulse' },
                    resize: { enable: true },
                },
                modes: {
                    bubble: {
                        distance: 400,
                        size: 4,
                        duration: 0.3,
                        opacity: 1,
                    },
                    repulse: { distance: 200, duration: 0.4 },
                },
            },
            detectRetina: true,
        }),
        []
    );

    if (!ready) {
        return null;
    }

    return <Particles id="tsparticles" options={options} />;
}
