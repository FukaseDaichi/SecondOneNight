package com.boardgame.app.entity.werewolf.roll;

import com.boardgame.app.constclass.werewolf.WereWolfConst;
import com.boardgame.app.entity.werewolf.WerewolfRoll;

public class WhiteWerewolf extends WerewolfRoll {

	public WhiteWerewolf() {
		rollNo = WereWolfConst.ROLL_NO_WHITEWEREWOLF;
		teamNo = WereWolfConst.TEAM_NO_WEREWOLF;
		name = "白狼";
		winDescription = "処刑されない";
		description = "この役職は人狼として扱う。味方の人狼が誰かわかる。"
				+ "役職選択のとき村人として表示される。";
		missingAbleFlg = false; // 欠けなし
	}

}
