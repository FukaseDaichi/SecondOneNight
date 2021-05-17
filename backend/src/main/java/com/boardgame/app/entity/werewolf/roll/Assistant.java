package com.boardgame.app.entity.werewolf.roll;

import java.util.List;

import com.boardgame.app.constclass.werewolf.WereWolfConst;
import com.boardgame.app.entity.werewolf.WerewolfRoll;
import com.boardgame.app.entity.werewolf.WerewolfRoom;
import com.boardgame.app.entity.werewolf.WerewolfUser;
import com.boardgame.app.exception.ApplicationException;

public class Assistant extends WerewolfRoll {

	public Assistant() {
		super();
		votingSize = 0;
		votingAbleFlg = false;
		rollNo = WereWolfConst.ROLL_NO_ASSISTANT;
		teamNo = WereWolfConst.TEAM_NO_VILLAGER;
		name = "付き人";
		winDescription = "※人狼の処刑";
		description = "この役職は投票できない。議論中に指定した人に従い、役職を確認できる。能力の使用はばれない。\r\n"
				+ "能力を使用した場合、従った人が勝利したとき、同時に自身の勝利となる。"
				+ "能力の使用をしていない場合、人狼の処刑で勝利となる。";
		actionName = "従う";
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

		if (usernameList.size() != 2) {
			return;
		}

		// 実行回数追加
		playUser.getRoll().setDiscussionActionCount(playUser.getRoll().getDiscussionActionCount() + 1);

		// 役職公開
		WerewolfUser targetUser = room.getWerewolfUser(usernameList.get(1));
		targetUser.getRoll().getOpenTargetUsernameList().add(playUser.getUserName());

		// 自身のチーム番号変更
		playUser.getRoll().setTeamNo(targetUser.getRoll().getTeamNo());

		// メッセージ追加
		playUser.setLastMessage(String.format(WereWolfConst.MSG_ASSISTANT, targetUser.getUserName()));

		if (targetUser.getRoll().getRollNo() == WereWolfConst.ROLL_NO_TERUTERU) {
			room.judgement();
		}

	}

}