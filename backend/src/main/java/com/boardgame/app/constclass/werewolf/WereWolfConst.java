package com.boardgame.app.constclass.werewolf;

import com.boardgame.app.entity.werewolf.WerewolfRoll;
import com.boardgame.app.entity.werewolf.roll.Assasin;
import com.boardgame.app.entity.werewolf.roll.Assistant;
import com.boardgame.app.entity.werewolf.roll.Dictator;
import com.boardgame.app.entity.werewolf.roll.Diviner;
import com.boardgame.app.entity.werewolf.roll.Madman;
import com.boardgame.app.entity.werewolf.roll.Mayor;
import com.boardgame.app.entity.werewolf.roll.Teruteru;
import com.boardgame.app.entity.werewolf.roll.Villager;
import com.boardgame.app.entity.werewolf.roll.Werewolf;
import com.boardgame.app.entity.werewolf.roll.Zealot;

public class WereWolfConst {

	public static final String ROOM_TYPE = "WEREWOLF";

	public static final String MSG_VOTING = "「%s」に投票";
	public static final String MSG_DIVINER = "「%s」を占った";
	public static final String MSG_ASSISTANT = "「%s」に従った";
	public static final String MSG_ASSASSIN = "「%s」を暗殺した";

	public static final String USERNAME_NPC = "NPC";

	// RollNo（役職追加時に要修正）
	public static final int ROLL_SIZE = 10;
	public static final int ROLL_NO_WEREWOLF = 1;
	public static final int ROLL_NO_VILLAGER = 2;
	public static final int ROLL_NO_MAYOR = 3;
	public static final int ROLL_NO_TERUTERU = 4;
	public static final int ROLL_NO_MADMAN = 5;
	public static final int ROLL_NO_DICTATOR = 6;
	public static final int ROLL_NO_ZEALOT = 7;
	public static final int ROLL_NO_DIVINER = 8;
	public static final int ROLL_NO_ASSISTANT = 9;
	public static final int ROLL_NO_ASSASSIN = 10;

	// TeamNo
	public static final int TEAM_NO_WEREWOLF = 1;
	public static final int TEAM_NO_VILLAGER = 2;
	public static final int TEAM_NO_TERUTERU = 3;

	// 役職作成（役職追加時に要修正）
	public static WerewolfRoll createRoll(int rollNum) {
		WerewolfRoll roll = null;

		switch (rollNum) {
		case WereWolfConst.ROLL_NO_WEREWOLF:
			roll = new Werewolf();
			break;
		case WereWolfConst.ROLL_NO_VILLAGER:
			roll = new Villager();
			break;

		case WereWolfConst.ROLL_NO_MAYOR:
			roll = new Mayor();
			break;

		case WereWolfConst.ROLL_NO_TERUTERU:
			roll = new Teruteru();
			break;

		case WereWolfConst.ROLL_NO_MADMAN:
			roll = new Madman();
			break;

		case WereWolfConst.ROLL_NO_DICTATOR:
			roll = new Dictator();
			break;

		case WereWolfConst.ROLL_NO_ZEALOT:
			roll = new Zealot();
			break;

		case WereWolfConst.ROLL_NO_DIVINER:
			roll = new Diviner();
			break;

		case WereWolfConst.ROLL_NO_ASSISTANT:
			roll = new Assistant();
			break;

		case WereWolfConst.ROLL_NO_ASSASSIN:
			roll = new Assasin();
			break;
		}
		return roll;
	}

}
