/* eslint-disable @typescript-eslint/no-namespace */
/** システム定数クラス */
export namespace SystemConst {
    /** サーバー */
    export namespace Server {
        /** ホスト名 */
        //export const AP_HOST = 'http://localhost:8080/';
        export const AP_HOST = 'https://boardgameap.herokuapp.com/';
        export const CREATE_ROOM = 'createroom';
        export const ENDPOINT = 'boardgame-endpoint';
        export const SITE_URL = 'https://board-game-three.vercel.app';
    }

    export namespace Message {
        export const MSG_SYSTEMERR = 'エラーが発生しました。';
    }
    // ファイル一覧
    export const ICON_LIST: string[] = [
        'icon1.jpeg',
        'icon1.jpg',
        'icon2.jpeg',
        'icon2.jpg',
        'icon3.jpeg',
        'icon3.jpg',
        'icon4.jpeg',
        'icon4.jpg',
        'icon5.jpeg',
        'icon5.jpg',
        'icon6.jpeg',
        'icon6.jpg',
        'icon7.jpeg',
        'icon7.jpg',
        'icon8.jpeg',
        'icon8.jpg',
        'icon9.jpg',
        'icon10.jpg',
        'icon11.jpg',
        'icon12.jpg',
        'icon13.jpg',
        'icon14.jpg',
        'icon15.jpg',
        'icon16.jpg',
    ];

    export const PLAYER_COLOR_LIST: string[] = [
        '#55A9D4',
        '#50C5B8',
        '#C6DC6E',
        '#FADF68',
        '#DD707F',
        '#C969A6',
        '#9499C5',
        '#D27EB3',
        '#FBE481',
        '#EBF182',
        '#81D674',
        '#68CFC3',
        '#6CBAD8',
        '#B492CC',
        '#55A9D4',
        '#55A9D4',
        '#55A9D4',
    ];

    export const TEAM_COLOR_LIST: string[] = [
        '#ffffff',
        '#905069',
        '#334576',
        '#ffffff',
    ];
}
