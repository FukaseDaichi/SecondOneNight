import React from 'react';
import { DecryptUser } from '../../type/decrypt';
import styles from '../../styles/components/decrypt/userdatainfo.module.scss';

type UserDataInfoProps = {
    decryptUser: DecryptUser;
};

export default function UserDataInfo(props: UserDataInfoProps): JSX.Element {
    return (
        <div className={styles.userdatainfo}>{props.decryptUser.userName}</div>
    );
}
