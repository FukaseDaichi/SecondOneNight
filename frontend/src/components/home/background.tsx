import React from 'react';
import Particles from 'react-tsparticles';
import { IOptions, RecursivePartial } from 'tsparticles';
import ParticlesParams from '../../const/json/particlesjs-config.json';

export default function Background(): JSX.Element {
    const data: RecursivePartial<IOptions> =
        ParticlesParams as RecursivePartial<IOptions>;

    return <Particles params={data} />;
}
