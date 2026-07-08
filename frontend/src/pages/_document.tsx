import React from 'react';

import Document, { Html, Head, Main, NextScript } from 'next/document';
class DocumentTsx extends Document {
     
    static async getInitialProps(ctx) {
        const initialProps = await Document.getInitialProps(ctx);
        return { ...initialProps };
    }

     
    render() {
        return (
            <Html lang="ja">
                <Head>
                    <link
                        rel="preconnect"
                        href="https://fonts.googleapis.com"
                    />
                    <link
                        rel="preconnect"
                        href="https://fonts.gstatic.com"
                        crossOrigin=""
                    />
                    <link
                        rel="stylesheet"
                        href="https://fonts.googleapis.com/css?family=Patrick+Hand+SC&display=swap"
                    />
                    <link
                        rel="stylesheet"
                        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500&display=swap"
                    />
                    <link
                        rel="stylesheet"
                        href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;600;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap"
                    />
                    <meta name="mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <link
                        rel="icon"
                        type="image/png"
                        sizes="96x96"
                        href="/favicon/favicon-96x96.png"
                    />
                    <link
                        rel="icon"
                        type="image/svg+xml"
                        href="/favicon/favicon.svg"
                    />
                    <link rel="shortcut icon" href="/favicon/favicon.ico" />
                    <link
                        rel="apple-touch-icon"
                        sizes="180x180"
                        href="/favicon/apple-touch-icon.png"
                    />
                    <link rel="manifest" href="/favicon/site.webmanifest" />
                    <meta name="theme-color" content="#ffffff" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default DocumentTsx;
