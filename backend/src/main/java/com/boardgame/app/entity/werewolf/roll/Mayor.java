package com.boardgame.app.entity.werewolf.roll;

import com.boardgame.app.constclass.werewolf.WereWolfConst;
import com.boardgame.app.entity.werewolf.WerewolfRoll;

public class Mayor extends WerewolfRoll {

	public Mayor() {
		rollNo = WereWolfConst.ROLL_NO_MAYOR;
		teamNo = WereWolfConst.TEAM_NO_VILLAGER;
		name = "村長";
		winDescription = "人狼の処刑";
		description = "投票時に2票分として扱う";
		votingSize = 2;
	}

}