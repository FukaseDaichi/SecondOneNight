import React from 'react';

import Document, { Html, Head, Main, NextScript } from 'next/document';
class DocumentTsx extends Document {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static async getInitialProps(ctx) {
        const initialProps = await Document.getInitialProps(ctx);
        return { ...initialProps };
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    render() {
        return (
            <Html lang="ja">
                <Head>
                    <meta name="mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <link
                        rel="apple-touch-icon"
                        sizes="180x180"
                        href="/favicons/apple-touch-icon.png"
                    />
                    <link
                        rel="icon"
                        type="image/png"
                        sizes="32x32"
                        href="/favicons/favicon-32x32.png"
                    />
                    <link
                        rel="icon"
                        type="image/png"
                        sizes="16x16"
                        href="/favicons/favicon-16x16.png"
                    />
                    <link rel="manifest" href="/favicons/site.webmanifest" />
                    <link
                        rel="mask-icon"
                        href="/favicons/safari-pinned-tab.svg"
                        color="#000000"
                    />
                    <link rel="shortcut icon" href="/favicons/favicon.ico" />
                    <meta name="msapplication-TileColor" content="#ffffff" />
                    <meta
                        name="msapplication-config"
                        content="/favicons/browserconfig.xml"
                    />
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
