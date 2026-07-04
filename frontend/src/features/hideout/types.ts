import type { SocketInfo } from '../../type';

// サーバ由来フィールドの詳細型は Stage 4 で精緻化する
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HideoutUser = { userName: string; userNo: number; userIconUrl: string | null } & Record<string, any>;

export type HideoutState = {
    // room
    playerName: string | null;
    messageList: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatList: any[];
    // gamedata(サーバ由来。現行 dataSet が設定していたもの)
    userList: HideoutUser[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    memberFirldList: any[];
    rushFlg: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    firldBuilding: any | null;
    waitUserIndexList: number[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    memberCardList: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    buildingCardList: any[];
    winnerTeam: number;
    turn: number;
    // view(現行 useEffect が導出していたもの)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    viewMemberCardList: any[];
    startFlg: boolean;
    rushAreaFlg: boolean;
    swatWinFlg: boolean;
    terroristWinFlg: boolean;
};

export type HideoutAction =
    | { type: 'message'; payload: SocketInfo }
    | { type: 'roomIn'; userName: string }
    | { type: 'chatSent'; message: string }
    | { type: 'systemMessage'; text: string }
    | { type: 'dismissStart' }
    | { type: 'closeRushArea' }
    | { type: 'dismissSwatWin' }
    | { type: 'dismissTerroristWin' };
