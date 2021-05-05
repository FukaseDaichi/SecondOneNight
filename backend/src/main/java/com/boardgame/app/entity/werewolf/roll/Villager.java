package com.boardgame.app.entity.werewolf.roll;

import java.util.List;

import com.boardgame.app.entity.werewolf.WerewolfRoll;
import com.boardgame.app.entity.werewolf.WerewolfRoom;

public class Villager extends WerewolfRoll {

	public Villager() {
		rollNo = 2;
		teamNo = 2;
		name = "村人";
		winDescription = "人狼の処刑";
		description = "人狼を処刑しよう！";
	}

	@Override
	public void discussionAction(WerewolfRoom room, List<String> usernameList) {
		// 議論中のアクションなし
		return;
	}

}