export type TimebombState = {
    playerName: string; // 初期値 ''(他ゲームと異なり null でない)
    messageList: string[];
    // gamedata
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    timeBombUserList: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    leadCardsList: any[];
    round: number;
    turn: number;
    releaseNo: number;
    limitTime: number;
    secretFlg: boolean;
    // view
    startFlg: boolean;
    roundMessageFlg: boolean;
    endFlg: boolean;
    bommerFlg: boolean;
    policeFlg: boolean;
};

export type TimebombAction =
    // 受信は2系統あるため payload は any(status 有無を reducer 内で判定)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | { type: 'message'; payload: any }
    | { type: 'roomIn'; userName: string }
    | { type: 'systemMessage'; text: string }
    | { type: 'dismissStart' }
    | { type: 'dismissRoundMessage' };
