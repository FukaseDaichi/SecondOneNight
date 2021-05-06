package com.boardgame.app.entity.werewolf.roll;

import com.boardgame.app.constclass.werewolf.WereWolfConst;
import com.boardgame.app.entity.werewolf.WerewolfRoll;

public class Zealot extends WerewolfRoll {

	public Zealot() {
		rollNo = WereWolfConst.ROLL_NO_ZEALOT;
		teamNo = WereWolfConst.TEAM_NO_WEREWOLF;
		name = "狂信者";
		winDescription = "人狼が処刑されない";
		description = "人狼が誰か把握できる";
	}

}
