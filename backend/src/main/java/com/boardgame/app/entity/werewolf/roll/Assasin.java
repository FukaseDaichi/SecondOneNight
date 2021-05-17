package com.boardgame.app.entity.werewolf.roll;

import java.util.List;

import com.boardgame.app.constclass.werewolf.WereWolfConst;
import com.boardgame.app.entity.werewolf.WerewolfRoll;
import com.boardgame.app.entity.werewolf.WerewolfRoom;
import com.boardgame.app.entity.werewolf.WerewolfUser;
import com.boardgame.app.exception.ApplicationException;

public class Assasin extends WerewolfRoll {

	public Assasin() {

		rollNo = WereWolfConst.ROLL_NO_ASSASSIN;
		teamNo = WereWolfConst.TEAM_NO_WEREWOLF;
		name = "暗殺者";
		winDescription = "人狼が処刑されない";
		description = "議論中に指定した人を殺害できる。\r\n"
				+ "その場合、殺害された人は議論に参加できなくなり、投票もできない。";
		actionName = "暗殺";
	}

	/**
	 * usernameList[0] 自分の名前
	 * usernameList[1] 対象の名前
	 */
	@Override
	public void discussionAction(WerewolfRoom room, List<String> usernameList) throws ApplicationException {

		WerewolfUser playUser = room.getWerewolfUser(usernameList.get(0));
		room.setCutInUserNo(playUser.getUserNo());

		if (playUser.getRoll().getDiscussionActionCount() > 0) {
			return;
		}

		if (usernameList.size() != 2) {
			return;
		}

		// 実行回数追加
		playUser.getRoll().setDiscussionActionCount(playUser.getRoll().getDiscussionActionCount() + 1);

		WerewolfUser targetUser = room.getWerewolfUser(usernameList.get(1));

		// ターゲットユーザ処刑
		targetUser.getRoll().setDiscussionActionCount(99);
		targetUser.getRoll().setPunishmentFlg(true);
		targetUser.getRoll().setVotingAbleFlg(false);
		targetUser.getRoll().setVotingSize(0);

		// メッセージ追加
		playUser.setLastMessage(String.format(WereWolfConst.MSG_ASSASSIN, targetUser.getUserName()));

	}

}