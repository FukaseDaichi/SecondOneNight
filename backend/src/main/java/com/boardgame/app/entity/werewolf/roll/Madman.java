package com.boardgame.app.entity.werewolf.roll;

import java.util.List;

import com.boardgame.app.entity.werewolf.WerewolfRoll;
import com.boardgame.app.entity.werewolf.WerewolfRoom;

public class Madman extends WerewolfRoll {

	public Madman() {
		rollNo = 5;
		teamNo = 1;
		name = "狂人";
		winDescription = "人狼が処刑されない";
		description = "人狼のサポートをしよう";
	}

	@Override
	public void discussionAction(WerewolfRoom room, List<String> usernameList) {
		// 議論中のアクションなし
		return;
	}

}