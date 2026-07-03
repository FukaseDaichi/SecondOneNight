import React from 'react';
import styles from '../../styles/components/button/socialbtn.module.scss';

import {
    FacebookShareButton,
    FacebookIcon,
    TwitterShareButton,
    TwitterIcon,
    LineShareButton,
    LineIcon,
} from 'react-share';

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

export default function Socialbtn(props: SocialProps): JSX.Element {
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
