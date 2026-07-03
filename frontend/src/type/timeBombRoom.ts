import { TimeBombUser, LeadCards } from "./";
export type TimeBombRoom = {
	maxUserSize: number;
	roomType: string;
	roomId: string;
	userList: Array<TimeBombUser>;
	turn: number;
	leadCardsList: Array<LeadCards>;
	round: number;
};
