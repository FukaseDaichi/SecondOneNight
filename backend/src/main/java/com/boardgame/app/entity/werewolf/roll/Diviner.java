package com.boardgame.app.entity.werewolf.roll;

import java.util.List;

import com.boardgame.app.entity.werewolf.WerewolfRoll;
import com.boardgame.app.entity.werewolf.WerewolfRoom;

public class Diviner extends WerewolfRoll {

	public Diviner() {
		rollNo = 8;
		teamNo = 2;
		name = "占い師";
		winDescription = "人狼の処刑";
		description = "議論中に占える（自分を選択）\r\n"
				+ "指名した1人の役職がわかるが、投票できなくなる。能力の使用はばれない。";
	}

	@Override
	public void discussionAction(WerewolfRoom room, List<String> usernameList) {
		// 議論中のアクションあるぞ！
		return;
	}

}