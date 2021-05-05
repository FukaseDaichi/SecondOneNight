package com.boardgame.app.entity.werewolf.roll;

import java.util.List;

import com.boardgame.app.entity.werewolf.WerewolfRoll;
import com.boardgame.app.entity.werewolf.WerewolfRoom;
import com.boardgame.app.exception.ApplicationException;

public class Dictator extends WerewolfRoll {

	public Dictator() {

		rollNo = 6;
		teamNo = 2;
		name = "独裁者";
		winDescription = "人狼の処刑";
		description = "議論中に役職の開示ができる。（自分を選択）\r\n"
				+ "その場合、指名した1人を直ちに処刑する。";
	}

	@Override
	public void discussionAction(WerewolfRoom room, List<String> usernameList) throws ApplicationException {
		// 議論中のアクションあるぞ
		return;
	}

}