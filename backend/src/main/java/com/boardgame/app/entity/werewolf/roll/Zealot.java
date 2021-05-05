package com.boardgame.app.entity.werewolf.roll;

import java.util.List;

import com.boardgame.app.entity.werewolf.WerewolfRoll;
import com.boardgame.app.entity.werewolf.WerewolfRoom;

public class Zealot extends WerewolfRoll {

	public Zealot() {
		rollNo = 7;
		teamNo = 1;
		name = "狂信者";
		winDescription = "人狼が処刑されない";
		description = "人狼が誰か把握できる";
	}

	@Override
	public void discussionAction(WerewolfRoom room, List<String> usernameList) {
		// 議論中のアクションなし
		return;
	}

}
