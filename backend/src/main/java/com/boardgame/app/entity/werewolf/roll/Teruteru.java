package com.boardgame.app.entity.werewolf.roll;

import java.util.List;

import com.boardgame.app.entity.werewolf.WerewolfRoll;
import com.boardgame.app.entity.werewolf.WerewolfRoom;

public class Teruteru extends WerewolfRoll {

	public Teruteru() {
		rollNo = 4;
		teamNo = 3;
		name = "てるてる";
		winDescription = "自身の処刑";
		description = "自分の処刑で1人勝ち";
		point = 2;

	}

	@Override
	public void discussionAction(WerewolfRoom room, List<String> usernameList) {
		// 議論中のアクションなし
		return;
	}

}