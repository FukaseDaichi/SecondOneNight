import styles from '../../styles/components/button/socialbtn.module.scss';

import {
    FacebookShareButton,
    FacebookIcon,
    XShareButton,
    XIcon,
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
    const size = props.size ? props.size : config.size;
    return (
        <div className={styles.socialbtnarea}>
            <p className={styles.label}>この部屋をシェア</p>
            <div>
                <FacebookShareButton url={props.url}>
                    <FacebookIcon size={size} round />
                </FacebookShareButton>

                <XShareButton url={props.url} title={props.title}>
                    <XIcon size={size} round />
                </XShareButton>

                <LineShareButton url={props.url} title={props.title}>
                    <LineIcon size={size} round></LineIcon>
                </LineShareButton>
            </div>
        </div>
    );
}
