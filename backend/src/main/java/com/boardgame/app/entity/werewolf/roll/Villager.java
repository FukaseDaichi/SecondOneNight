package com.boardgame.app.entity.werewolf.roll;

import com.boardgame.app.constclass.werewolf.WereWolfConst;
import com.boardgame.app.entity.werewolf.WerewolfRoll;

public class Villager extends WerewolfRoll {

	public Villager() {
		rollNo = WereWolfConst.ROLL_NO_VILLAGER;
		teamNo = WereWolfConst.TEAM_NO_VILLAGER;
		name = "村人";
		winDescription = "人狼の処刑";
		description = "人狼を処刑しよう！";
	}

}