import { WerewolfRoll } from "./werewolfroll";

export type WerewolfUser = {
	userNo: number;
	userId: string;
	userName: string;
	userIconUrl: string;

	roll: WerewolfRoll;
	handRollList: Array<WerewolfRoll>;
	score: number;
	lastMessage: string;
	votingUserName: string;
};
