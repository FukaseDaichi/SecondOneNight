import React from 'react';
import Head from 'next/head';
import styles from '../styles/components/layout.module.css';
import { SystemConst } from '../const/next.config';

export const siteTitle = 'ボードゲームの部屋';
interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: any;
    home?: boolean;
}

export default function Layout(props: Props): JSX.Element {
    return (
        <div className={styles.container}>
            <Head>
                <meta name="description" content="ボードゲームの部屋" />
                <meta property="og:url" content={SystemConst.Server.SITE_URL} />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content={siteTitle} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@2d7rqU5gFQ6VpGo" />
            </Head>
            <header className={styles.header}></header>
            <main>{props.children}</main>
        </div>
    );
}
