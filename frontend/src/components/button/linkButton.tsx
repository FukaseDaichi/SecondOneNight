import React from 'react';
import Link from 'next/link';

interface Props {
    href: string;
    clickFnk: () => void;
    value: string;
}

export default function LinkButton(props: Props): JSX.Element {
    return (
        <Link href={props.href} passHref>
            <button onClick={props.clickFnk}>{props.value}</button>
        </Link>
    );
}
