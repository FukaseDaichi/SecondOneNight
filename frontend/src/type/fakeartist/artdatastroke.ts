import { ArtData } from './artdata';

export type ArtDataStroke = {
    artDataList: Array<ArtData>;
    name: string;
    color: string;
    lineWidth: number;
    endFlg: boolean;
};
