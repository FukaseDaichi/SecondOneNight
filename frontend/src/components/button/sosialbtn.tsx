import React from 'react';
import styles from '../../styles/components/button/socialbtn.module.scss';

import {
    FacebookShareButton as RawFacebookShareButton,
    FacebookIcon as RawFacebookIcon,
    TwitterShareButton as RawTwitterShareButton,
    TwitterIcon as RawTwitterIcon,
    LineShareButton as RawLineShareButton,
    LineIcon as RawLineIcon,
} from 'react-share';

// react-share@4 の型定義が React 19 の DOM 型と非互換のためキャストで吸収する。
// ランタイム挙動は変えない。react-share の更新は Stage 2 以降で扱う。
const FacebookShareButton = RawFacebookShareButton as React.FC<any>;
const FacebookIcon = RawFacebookIcon as React.FC<any>;
const TwitterShareButton = RawTwitterShareButton as React.FC<any>;
const TwitterIcon = RawTwitterIcon as React.FC<any>;
const LineShareButton = RawLineShareButton as React.FC<any>;
const LineIcon = RawLineIcon as React.FC<any>;

const config = {
    via: 'kara_d',
    size: 32,
};

interface SocialProps {
    url: string;
    title: string;
    size?: number;
    via?: string;
}

export default function Socialbtn(props: SocialProps) {
    return (
        <div className={styles.socialbtnarea}>
            <div>
                <FacebookShareButton url={props.url}>
                    <FacebookIcon
                        size={props.size ? props.size : config.size}
                        round
                    />
                </FacebookShareButton>

                <TwitterShareButton
                    url={props.url}
                    title={props.title}
                    via={props.via ? props.via : config.via}
                >
                    <TwitterIcon
                        size={props.size ? props.size : config.size}
                        round
                    />
                </TwitterShareButton>

                <LineShareButton url={props.url} title={props.title}>
                    <LineIcon
                        size={props.size ? props.size : config.size}
                        round
                    ></LineIcon>
                </LineShareButton>
            </div>
        </div>
    );
}
