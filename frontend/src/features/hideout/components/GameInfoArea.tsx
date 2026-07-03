/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Chatmessage from '../../../components/message/chatmessage';
import HideoutHeadInfo from './hideoutheadinfo';
import GameInfo from './gameinfo';
import { HideoutUser } from '../types';

type GameInfoAreaProps = {
    turn: number;
    userList: HideoutUser[];
    viewMemberCardList: any[];
    buildingCardList: any[];
    memberCardList: any[];
    messageList: string[];
};

export default function GameInfoArea({
    turn,
    userList,
    viewMemberCardList,
    buildingCardList,
    memberCardList,
    messageList,
}: GameInfoAreaProps) {
    return (
        <>
            {turn > 0 && (
                <HideoutHeadInfo
                    userList={userList}
                    memberCardList={viewMemberCardList}
                />
            )}
            {turn > 0 && (
                <GameInfo
                    buildingCardList={buildingCardList}
                    memberCardList={memberCardList}
                />
            )}
            {messageList.map((value, index) => {
                if (index === messageList.length - 1) {
                    return (
                        <Chatmessage value={value} type="info" key={index} />
                    );
                }
            })}
        </>
    );
}
