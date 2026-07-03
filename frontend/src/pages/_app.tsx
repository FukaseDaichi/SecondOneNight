import React from 'react';
import type { AppProps } from 'next/app';
import '../styles/bootstrap.min.css';
import '../styles/global.scss';
import { useEffect } from 'react';

export default function App(props: AppProps) {
    useEffect(() => {
        document.querySelector('body').setAttribute('ontouchstart', '');
    });

    return <props.Component {...props.pageProps} />;
}
