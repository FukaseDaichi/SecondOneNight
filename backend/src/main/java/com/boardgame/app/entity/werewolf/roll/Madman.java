package com.boardgame.app.entity.werewolf.roll;

import com.boardgame.app.constclass.werewolf.WereWolfConst;
import com.boardgame.app.entity.werewolf.WerewolfRoll;

public class Madman extends WerewolfRoll {

	public Madman() {
		rollNo = WereWolfConst.ROLL_NO_MADMAN;
		teamNo = WereWolfConst.TEAM_NO_WEREWOLF;
		name = "狂人";
		winDescription = "人狼が処刑されない";
		description = "人狼のサポートをしよう";
	}

}