package com.boardgame.app.entity.werewolf.roll;

import java.util.List;

import com.boardgame.app.entity.werewolf.WerewolfRoll;
import com.boardgame.app.entity.werewolf.WerewolfRoom;

public class Werewolf extends WerewolfRoll {

	// 1:人狼
	public Werewolf() {
		rollNo = 1;
		teamNo = 1;
		name = "人狼";
		winDescription = "処刑されない";
		description = "味方の人狼が誰かわかる";
		missingAbleFlg = false; // 欠けなし
	}

	/**
	 * usernameList 0:自分のユーザ名
	 * usernameList 1:対象のユーザ名
	 */
	@Override
	public void discussionAction(WerewolfRoom room, List<String> usernameList) {
		// 議論中のアクションなし
		return;
	}

}
