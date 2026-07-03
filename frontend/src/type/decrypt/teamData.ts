import { TurnData } from "./turnData";

export type TeamData = {
  successChipCount: number;
  faildChipCount: Array<number>;
  codeWordList: Array<string>;
  turnDataList: Array<TurnData>;
  tebanFlg: boolean;
};
