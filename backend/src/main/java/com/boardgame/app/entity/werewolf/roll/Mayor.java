package com.boardgame.app.entity.werewolf.roll;

import java.util.List;

import com.boardgame.app.entity.werewolf.WerewolfRoll;
import com.boardgame.app.entity.werewolf.WerewolfRoom;

public class Mayor extends WerewolfRoll {

	public Mayor() {
		rollNo = 3;
		teamNo = 2;
		name = "村長";
		winDescription = "人狼の処刑";
		description = "投票時に2票分として扱う";
		votingSize = 2;
	}

	@Override
	public void discussionAction(WerewolfRoom room, List<String> usernameList) {
		// 議論中のアクションなし
		return;
	}

}