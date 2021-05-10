package com.boardgame.app.entity.werewolf;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import com.boardgame.app.constclass.SystemConst;
import com.boardgame.app.constclass.werewolf.WereWolfConst;
import com.boardgame.app.entity.User;
import com.boardgame.app.entity.chat.ChatRoom;
import com.boardgame.app.entity.enif.LimitTimeInterface;
import com.boardgame.app.exception.ApplicationException;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class WerewolfRoom extends ChatRoom implements LimitTimeInterface {
	private static final long serialVersionUID = 518425262409993402L;
	private int limitTime;

	/**
	 * 0:初期値
	 * 1:役職選択
	 * 2:議論
	 * 3:投票
	 * 4:終了
	 */
	private int turn;

	private List<WerewolfRoll> rollList;
	private WerewolfUser npcuser;

	private List<WerewolfRoll> missingRollList;
	private List<Integer> winteamList;
	private boolean missingFlg;
	private int cutInUserNo;

	// 役職リスト
	private List<WerewolfRoll> staticRollList;

	public WerewolfRoom() {
		maxUserSize = 10; //仮置き最大人数
		userList = new ArrayList<User>();
		limitTime = 0;

		turn = 0;
		rollList = new ArrayList<WerewolfRoll>();
		missingRollList = new ArrayList<WerewolfRoll>();
		missingFlg = false;
		winteamList = new ArrayList<Integer>();
		npcuser = null;
		cutInUserNo = -1;

		staticRollList = new ArrayList<WerewolfRoll>();

		for (int i = 1; i <= WereWolfConst.ROLL_SIZE; i++) {
			staticRollList.add(WereWolfConst.createRoll(i));
		}

	}

	/**
	 * 役職設定
	 * 人数チェックも実施
	 * @param rollNoList
	 */
	public void setRollRegulation(List<Integer> rollNoList) throws ApplicationException {

		if (rollNoList.size() > 15) {
			throw new ApplicationException(SystemConst.ERR_MSG_OWNVIEW_STATUS_CODE, "役職の設定数が多すぎます");
		}

		if (rollNoList.size() <= userList.size()) {
			throw new ApplicationException(SystemConst.ERR_MSG_OWNVIEW_STATUS_CODE, "役職の数は参加者より多く設定してください");
		}

		List<WerewolfRoll> setingRollList = new ArrayList<WerewolfRoll>();

		int werewolfSize = 0;
		int teruteruSize = 0;
		for (Integer integer : rollNoList) {

			setingRollList.add(WereWolfConst.createRoll(integer));

			switch (integer) {

			// 人狼チェック
			case WereWolfConst.ROLL_NO_WEREWOLF:
				werewolfSize++;
				break;

			// てるてるチェック
			case WereWolfConst.ROLL_NO_TERUTERU:
				teruteruSize++;
				if (teruteruSize > 1) {
					throw new ApplicationException(SystemConst.ERR_MSG_OWNVIEW_STATUS_CODE, "てるてるは1人までしか設定できません");
				}
				break;
			}
		}

		if (werewolfSize < 1) {
			throw new ApplicationException(SystemConst.ERR_MSG_OWNVIEW_STATUS_CODE, "人狼が設定されていません");
		}
		rollList = setingRollList;

		checkMissingFlg();

	}

	public void init() throws ApplicationException {

		// 初期化
		turn = 1;
		missingRollList = new ArrayList<WerewolfRoll>();
		winteamList = new ArrayList<Integer>();
		npcuser = new WerewolfUser();
		npcuser.setUserName(WereWolfConst.USERNAME_NPC);
		npcuser.setUserNo(userList.size());
		cutInUserNo = -1;

		// 役職設定確認
		if (userList.size() < 3) {
			throw new ApplicationException(SystemConst.ERR_MSG_ALLVIEW_STATUS_CODE, "参加者が少ないため開始できません");
		}

		// 役職設定確認
		if (rollList.size() <= userList.size()) {
			throw new ApplicationException(SystemConst.ERR_MSG_ALLVIEW_STATUS_CODE, "役職の数は参加者より多く設定してください");
		}

		int loopCount = 0;

		// 役職のシャッフル
		for (loopCount = 0; loopCount < 100; loopCount++) {
			Collections.shuffle(rollList);
			boolean okFlg = false;
			for (int j = 0; j < userList.size() + 1; j++) {
				if (!rollList.get(j).isMissingAbleFlg()) {
					okFlg = true;
					break;
				}
			}
			if (okFlg) {
				break;
			}
		}

		if (loopCount > 100) {
			throw new ApplicationException("役職の設定が間違ってます。");
		}

		// 役職の番号付与
		for (int i = 0; i < rollList.size(); i++) {
			rollList.get(i).setNo(i);
		}

		// ユーザの設定
		Collections.shuffle(rollList);

		int rollIndex = 0;
		for (int i = 0; i < userList.size(); i++) {
			WerewolfUser user = (WerewolfUser) userList.get(i);
			user.setUserNo(i);
			user.setHandRollList(new ArrayList<WerewolfRoll>());
			user.setRoll(null);
			user.setVotingUser(null);
			user.setLastMessage("");

			if (i == 0) {
				user.getHandRollList().add(rollList.get(rollIndex));
				rollIndex++;
				user.getHandRollList().add(rollList.get(rollIndex));
				rollIndex++;
			} else {
				user.getHandRollList().add(rollList.get(rollIndex));
				rollIndex++;
			}
		}

		// 役職掛けの設定
		for (int i = rollIndex; i < rollList.size(); i++) {
			missingRollList.add(rollList.get(rollIndex));
		}

	}

	public void selectRoll(String userName, int rollNo) throws ApplicationException {

		WerewolfUser user = getWerewolfUser(userName);

		if (user == null) {
			throw new ApplicationException("ユーザがいません");
		}

		if (turn != 1) {
			throw new ApplicationException("ターンが経過してます");
		}

		if (user.getHandRollList().size() != 2) {
			throw new ApplicationException("手札不足です");
		}

		if (user.getRoll() != null) {
			throw new ApplicationException("役職が決定済みです");
		}

		// 役職設定
		user.setRoll(rollList.get(rollNo));

		WerewolfRoll nextRoll = user.getHandRollList().stream().filter(o -> o.getNo() != rollNo).findAny().orElse(null);
		int nextUserNo = user.getUserNo() + 1;

		if (nextUserNo >= userList.size()) {

			//終了
			npcuser.setRoll(nextRoll);
			turn = 2;

			for (User decisionUser : userList) {
				WerewolfUser werewolfUser = (WerewolfUser) decisionUser;

				// 人狼または狂信者の場合 人狼の役開示する
				if (werewolfUser.getRoll().getRollNo() == WereWolfConst.ROLL_NO_WEREWOLF
						|| werewolfUser.getRoll().getRollNo() == WereWolfConst.ROLL_NO_ZEALOT) {
					for (WerewolfRoll roll : rollList) {
						if (roll.getRollNo() == WereWolfConst.ROLL_NO_WEREWOLF) {
							roll.getOpenTargetUsernameList().add(werewolfUser.getUserName());
						}
					}
				}
			}

		} else {
			WerewolfUser nextUser = (WerewolfUser) userList.get(nextUserNo);
			nextUser.getHandRollList().add(nextRoll);
		}

		//手札を空にする
		user.getHandRollList().clear();

	}

	/**
	 * @param usernameList
	 */
	public void discussionAction(String username, List<String> usernameList) throws ApplicationException {

		if (turn != 2) {
			throw new ApplicationException("議論中ではありません");
		}
		getWerewolfUser(username).getRoll().discussionAction(this, usernameList);
	}

	@Override
	public User joinUser(String userName) throws ApplicationException {

		if (0 < turn && turn < 4) {
			throw new ApplicationException("プレイ中です");
		}

		if (userName.equals(WereWolfConst.USERNAME_NPC)) {
			throw new ApplicationException("その名前は使用できません");
		}

		User user = new WerewolfUser();
		user.setUserName(userName);
		addUser(user);

		checkMissingFlg();

		return user;
	}

	@Override
	public void doOverLimit(int turn) throws ApplicationException {

	}

	private void checkMissingFlg() {
		if (userList.size() + 1 < rollList.size()) {
			missingFlg = true;
		} else {
			missingFlg = false;
		}
	}

	public void voting(String username, String targetUsername) throws ApplicationException {
		WerewolfUser actionUser = getWerewolfUser(username);
		WerewolfUser targetUser = getWerewolfUser(targetUsername);

		if (turn != 3) {
			throw new ApplicationException("投票中ではありません");
		}
		// 投票
		actionUser.setVotingUser(targetUser);

		int noVotingCount = 0;
		for (User user : userList) {
			WerewolfUser werewolfUser = (WerewolfUser) user;
			if (werewolfUser.getVotingUser() == null) {
				noVotingCount++;
			}
		}

		// 全員投票していた場合
		if (noVotingCount == 0) {
			turn++;

			// 投票集計
			aggregate();

			// 判定
			judgement();

		}

	}

	/**
	 * 投票集計
	 */
	private void aggregate() {

		// ユーザの投票集計
		for (User user : userList) {
			WerewolfUser werewolfUser = (WerewolfUser) user;

			// 投票値に加算
			werewolfUser.getVotingUser().getRoll().setVotingCount(
					werewolfUser.getVotingUser().getRoll().getVotingCount() + werewolfUser.getRoll().getVotingSize());

			// メッセージ追加
			werewolfUser.setLastMessage(
					String.format(WereWolfConst.MSG_VOTING, werewolfUser.getVotingUser().getUserName()));

		}
	}

	public void judgement() {
		// ターン設定
		turn = 4;

		// 最大値取得
		int maxVotingCount = rollList.stream().max(Comparator.comparing(WerewolfRoll::getVotingCount)).get()
				.getVotingSize();

		// 処刑フラグ設定
		rollList.stream().filter(o -> o.getVotingCount() == maxVotingCount).forEach(o -> o.setPunishmentFlg(true));

		if (0 < rollList.stream().filter(o -> o.getRollNo() == WereWolfConst.ROLL_NO_TERUTERU && o.isPunishmentFlg())
				.count()) {
			// てるてるがつられていた場合
			winteamList.add(WereWolfConst.TEAM_NO_TERUTERU);
		} else if (0 < rollList.stream()
				.filter(o -> o.getRollNo() == WereWolfConst.ROLL_NO_WEREWOLF && o.isPunishmentFlg())
				.count()) {
			// 人狼がつられていた場合
			winteamList.add(WereWolfConst.TEAM_NO_VILLAGER);
		} else {
			// 人狼がつられていない場合
			winteamList.add(WereWolfConst.TEAM_NO_WEREWOLF);
		}

		// スコアに加算
		for (User user : userList) {
			WerewolfUser werewolfUser = (WerewolfUser) user;
			if (winteamList.contains(werewolfUser.getRoll().getTeamNo())) {
				werewolfUser.setScore(werewolfUser.getScore() + werewolfUser.getRoll().getPoint());
			}
		}

	}

	public WerewolfUser getWerewolfUser(String username) {
		return (WerewolfUser) userList.stream().filter(o -> username.equals(o.getUserName())).findAny().orElse(npcuser);
	}

}
