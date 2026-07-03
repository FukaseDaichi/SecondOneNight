export type WerewolfRoll = {
	rollNo: number;
	teamNo: number;
	name: string;
	winDescription: string;
	description: string;
	votingSize: number;
	point: number;
	discussionActionCount: number;
	openTargetUsernameList: Array<string>;
	missingAbleFlg: boolean;
	openFlg: boolean;
	no: number;
	votingCount: number;
	votingAbleFlg: boolean;
	punishmentFlg: boolean;
	actionName: string;
	fakeRollList: Array<WerewolfRoll>;
};
