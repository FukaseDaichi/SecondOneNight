package com.boardgame.app.entity.werewolf.roll;

import java.util.List;

import com.boardgame.app.constclass.werewolf.WereWolfConst;
import com.boardgame.app.entity.werewolf.WerewolfRoll;
import com.boardgame.app.entity.werewolf.WerewolfRoom;
import com.boardgame.app.entity.werewolf.WerewolfUser;
import com.boardgame.app.exception.ApplicationException;

public class Diviner extends WerewolfRoll {

	public Diviner() {
		rollNo = WereWolfConst.ROLL_NO_DIVINER;
		teamNo = WereWolfConst.TEAM_NO_VILLAGER;
		name = "占い師";
		winDescription = "人狼の処刑";
		description = "議論中に占える（自分を選択）\r\n"
				+ "指名した1人の役職がわかるが、投票できなくなる。能力の使用はばれない。";
	}

	/**
	 * usernameList[0] 自分の名前
	 * usernameList[1] 対象の名前
	 */
	@Override
	public void discussionAction(WerewolfRoom room, List<String> usernameList) throws ApplicationException {

		WerewolfUser playUser = room.getWerewolfUser(usernameList.get(0));

		if (playUser.getRoll().getDiscussionActionCount() > 0) {
			return;
		}

		// 実行回数追加
		playUser.getRoll().setDiscussionActionCount(playUser.getRoll().getDiscussionActionCount() + 1);

		WerewolfUser targetUser = room.getWerewolfUser(usernameList.get(0));
		targetUser.getRoll().getOpenTargetUsernameList().add(playUser.getUserName());
	}

}