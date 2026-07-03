import React from 'react';
import Router from 'next/router';

type GameButtonsProps = {
    className: string;
    turn: number;
    init: () => void;
};

export default function GameButtons(props: GameButtonsProps) {
    return (
        <div className={props.className}>
            <button
                onClick={() => {
                    Router.push('/');
                }}
            >
                HOME
            </button>
            <button onClick={props.init}>
                {props.turn > 0 && props.turn < 4 ? 'GAME RESET' : 'GAME START'}
            </button>
        </div>
    );
}
