package com.boardgame.app.entity.werewolf.roll;

import java.util.List;

import com.boardgame.app.constclass.werewolf.WereWolfConst;
import com.boardgame.app.entity.werewolf.WerewolfRoll;
import com.boardgame.app.entity.werewolf.WerewolfRoom;
import com.boardgame.app.entity.werewolf.WerewolfUser;
import com.boardgame.app.exception.ApplicationException;

public class Thief extends WerewolfRoll {

	public Thief() {

		rollNo = WereWolfConst.ROLL_NO_THIEF;
		teamNo = WereWolfConst.TEAM_NO_WEREWOLF;
		name = "怪盗";
		winDescription = "※人狼が処刑されない";
		description = "議論中にNPCと役職の交換ができる。\r\n"
				+ "能力を使用した場合、交換後の役職が勝利条件となる。能力の使用はばれない。能力の使用をしない場合、人狼が処刑されないことが勝利条件となる。"
				+ "※交換時点でNPCか自身が占い師などによって役職が開示されていた場合、それぞれ非公開になる。交換後に占われた場合、交換後の役職が開示される。";
		actionName = "怪盗";
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

		// 役職の交換
		WerewolfRoll roll = playUser.getRoll();
		playUser.setRoll(targetUser.getRoll());
		targetUser.setRoll(roll);

		// 自身の役職非公開
		playUser.getRoll().setOpenFlg(false);

		// 自身の殺害をキャンセル
		playUser.getRoll().setPunishmentFlg(false);

		// 開示をキャンセル
		playUser.getRoll().getOpenTargetUsernameList().clear();
		targetUser.getRoll().getOpenTargetUsernameList().clear();

		// メッセージ追加
		playUser.setLastMessage(WereWolfConst.MSG_THIEF);

	}

}