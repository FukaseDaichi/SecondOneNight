package com.boardgame.app.entity.werewolf.roll;

import com.boardgame.app.constclass.werewolf.WereWolfConst;
import com.boardgame.app.entity.werewolf.WerewolfRoll;

public class Werewolf extends WerewolfRoll {

	public Werewolf() {
		rollNo = WereWolfConst.ROLL_NO_WEREWOLF;
		teamNo = WereWolfConst.TEAM_NO_WEREWOLF;
		name = "人狼";
		winDescription = "処刑されない";
		description = "味方の人狼が誰かわかる";
		missingAbleFlg = false; // 欠けなし
	}

}
