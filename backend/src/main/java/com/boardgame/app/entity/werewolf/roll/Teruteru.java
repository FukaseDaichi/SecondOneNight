package com.boardgame.app.entity.werewolf.roll;

import com.boardgame.app.constclass.werewolf.WereWolfConst;
import com.boardgame.app.entity.werewolf.WerewolfRoll;

public class Teruteru extends WerewolfRoll {

	public Teruteru() {
		rollNo = WereWolfConst.ROLL_NO_TERUTERU;
		teamNo = WereWolfConst.TEAM_NO_TERUTERU;
		name = "てるてる";
		winDescription = "自身の処刑";
		description = "自分の処刑で1人勝ち";
		point = 2;

	}

}