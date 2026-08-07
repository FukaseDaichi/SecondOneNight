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
    size: 32,
};

interface SocialProps {
    url: string;
    title: string;
    size?: number;
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

                <TwitterShareButton url={props.url} title={props.title}>
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
