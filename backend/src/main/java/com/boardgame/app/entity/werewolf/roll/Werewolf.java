package com.boardgame.app.entity.werewolf.roll;

import java.util.List;

import com.boardgame.app.entity.werewolf.WerewolfRoll;
import com.boardgame.app.entity.werewolf.WerewolfRoom;

public class Werewolf extends WerewolfRoll {

	// 1:人狼
	public Werewolf(){
		rollNo = 1;
		teamNo = 1;
		name = "人狼";
		winDescription = "処刑されない";
		description = "生き抜け！ 議論を攪乱せよ！";
		missingAbleFlg = false; // 欠けなし
	}

	@Override
	public void discussionAction(WerewolfRoom room ,List<String> usernameList) {
		// 議論中のアクションなし
		return;
	}

}
