package com.boardgame.app.entity.werewolf.roll;

import java.util.List;

import com.boardgame.app.constclass.werewolf.WereWolfConst;
import com.boardgame.app.entity.werewolf.WerewolfRoll;
import com.boardgame.app.entity.werewolf.WerewolfRoom;
import com.boardgame.app.entity.werewolf.WerewolfUser;
import com.boardgame.app.exception.ApplicationException;

public class Dictator extends WerewolfRoll {

	public Dictator() {

		rollNo = WereWolfConst.ROLL_NO_DICTATOR;
		teamNo = WereWolfConst.TEAM_NO_VILLAGER;
		name = "独裁者";
		winDescription = "人狼の処刑";
		description = "議論中に役職の開示ができる。\r\n"
				+ "その場合、指名した1人を直ちに処刑する。";
		actionName = "独裁";
	}

	/**
	 * usernameList[0] 自分の名前
	 * usernameList[1] 対象の名前
	 */
	@Override
	public void discussionAction(WerewolfRoom room, List<String> usernameList) throws ApplicationException {

		WerewolfUser playUser = room.getWerewolfUser(usernameList.get(0));
		room.setCutInUserNo(playUser.getUserNo());

		// 役職開示
		playUser.getRoll().setOpenFlg(true);

		// 実行回数追加
		playUser.getRoll().setDiscussionActionCount(playUser.getRoll().getDiscussionActionCount() + 1);

		WerewolfUser targetUser = room.getWerewolfUser(usernameList.get(1));

		// ターゲットユーザ処刑
		targetUser.getRoll().setPunishmentFlg(true);

		// 投票追加
		targetUser.getRoll().setVotingCount(targetUser.getRoll().getVotingCount() + 1);

		// メッセージ追加
		playUser.setLastMessage(String.format(WereWolfConst.MSG_VOTING, targetUser.getUserName()));

		// 最終盤面へスキップ
		room.judgement();

	}

}