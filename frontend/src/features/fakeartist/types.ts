import type { SocketInfo } from '../../type';
import type { ArtDataStroke, FakeArtistUser } from '../../type/fakeartist';

export type FakeartistState = {
    playerName: string | null;
    playerData: FakeArtistUser | null; // keep-last。ただし status 150(自分の退出)で null に戻る
    messageList: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatList: any[];
    // gamedata(現行 dataSet の7フィールド)
    userList: FakeArtistUser[];
    turn: number;
    gameTime: number;
    theme: string;
    endMessage: string;
    patternList: number[];
    limitTime: number;
    // canvas 連携
    artDataStrokeList: ArtDataStroke[];
    remoteStroke: ArtDataStroke | null; // 他人の最新ストローク
    remoteStrokeSeq: number; // remoteStroke を描くトリガ(+1 ごとに1回描画)
    redrawSeq: number; // 全ストローク再描画トリガ(自分の入室/再入室時)
    clearSeq: number; // 全消去トリガ(ゲーム開始時)
    resultSeq: number; // 投票完了(gameTime 4 到達)トリガ。モバイル時の endFlg 遅延表示に使う
    // view
    startFlg: boolean;
    disscuttionStartFlg: boolean;
    votingStartFlg: boolean;
    personCanvasZindex: number; // -1 or 1
    endFlg: boolean;
};

export type FakeartistAction =
    | { type: 'message'; payload: SocketInfo }
    | { type: 'roomIn'; userName: string }
    | { type: 'chatSent'; message: string }
    | { type: 'systemMessage'; text: string }
    | { type: 'dismissStart' }
    | { type: 'dismissDisscuttionStart' }
    | { type: 'dismissVotingStart' }
    | { type: 'showEnd' }
    | { type: 'dismissEnd' }
    | { type: 'setPersonCanvasZindex'; value: number };
