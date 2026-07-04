import type { SocketInfo } from '../../type';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DecryptUser = { userName: string; userNo: number; userIconUrl: string | null } & Record<string, any>;

export type DecryptState = {
    playerName: string | null;
    // playerData: userList 内の自分。見つかった時のみ更新(現行 useEffect と同じ keep-last)
    playerData: DecryptUser | null;
    messageList: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatList: any[];
    // gamedata(現行 dataSet の7フィールド)
    userList: DecryptUser[];
    gameTime: number;
    turn: number;
    choiceMode: number;
    winnerTeam: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    leftTeam: any | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rightTeam: any | null;
    // view
    startFlg: boolean;
};

export type DecryptAction =
    | { type: 'message'; payload: SocketInfo }
    | { type: 'roomIn'; userName: string }
    | { type: 'chatSent'; message: string }
    | { type: 'systemMessage'; text: string }
    | { type: 'dismissStart' };
