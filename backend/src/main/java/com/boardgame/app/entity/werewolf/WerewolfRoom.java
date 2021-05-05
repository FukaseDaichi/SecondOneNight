package com.boardgame.app.entity.werewolf;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.boardgame.app.entity.User;
import com.boardgame.app.entity.chat.ChatRoom;
import com.boardgame.app.entity.enif.LimitTimeInterface;
import com.boardgame.app.entity.werewolf.roll.Dictator;
import com.boardgame.app.entity.werewolf.roll.Diviner;
import com.boardgame.app.entity.werewolf.roll.Madman;
import com.boardgame.app.entity.werewolf.roll.Mayor;
import com.boardgame.app.entity.werewolf.roll.Teruteru;
import com.boardgame.app.entity.werewolf.roll.Villager;
import com.boardgame.app.entity.werewolf.roll.Werewolf;
import com.boardgame.app.entity.werewolf.roll.Zealot;
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

	/**
	 * 役職設定
	 * 人数チェックも実施
	 * @param rollNoList
	 */

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
	}

	public void setRollRegulation(List<Integer> rollNoList) throws ApplicationException {

		if (rollNoList.size() > 15) {
			throw new ApplicationException("役職の設定数が多すぎます。");
		}

		List<WerewolfRoll> setingRollList = new ArrayList<WerewolfRoll>();

		int werewolfSize = 0;
		int teruteruSize = 0;
		for (Integer integer : rollNoList) {
			switch (integer) {
			case 1:
				rollList.add(new Werewolf());
				werewolfSize++;
				break;
			case 2:
				rollList.add(new Villager());
				break;

			case 3:
				rollList.add(new Mayor());
				break;

			case 4:
				rollList.add(new Teruteru());
				teruteruSize++;
				if (teruteruSize > 1) {
					throw new ApplicationException("てるてるは1人までしか設定できません。");
				}
				break;

			case 5:
				rollList.add(new Madman());
				break;

			case 6:
				rollList.add(new Dictator());
				break;

			case 7:
				rollList.add(new Zealot());
				break;

			case 8:
				rollList.add(new Diviner());
				break;
			}
		}

		if (werewolfSize < 1) {
			throw new ApplicationException("人狼が設定されていません");
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
		npcuser.setUserName("NPC");
		npcuser.setUserNo(userList.size());
		cutInUserNo = -1;

		// 役職設定確認
		if (userList.size() < 3) {
			throw new ApplicationException("人数が少なすぎます。");
		}

		// 役職設定確認
		if (rollList.size() <= userList.size()) {
			throw new ApplicationException("役職の数は人数より多く設定してください");
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
			user.setUserNo(1);
			user.setHandRollList(new ArrayList<WerewolfRoll>());
			user.setRoll(null);
			user.setVotingCount(0);
			user.setLastMessage(null);

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
		} else {
			WerewolfUser nextUser = (WerewolfUser) userList.get(nextUserNo);
			nextUser.getHandRollList().add(nextRoll);
		}

		//手札を空にする
		user.getHandRollList().clear();

	}

	@Override
	public User joinUser(String userName) throws ApplicationException {

		if (0 < turn && turn < 4) {
			throw new ApplicationException("プレイ中です");
		}

		User user = new WerewolfUser();
		user.setUserName(userName);
		addUser(user);

		checkMissingFlg();

		return user;
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
	public void doOverLimit(int turn) throws ApplicationException {

	}

	private void checkMissingFlg() {
		if (userList.size() + 1 < rollList.size()) {
			missingFlg = true;
		} else {
			missingFlg = false;
		}
	}

	public WerewolfUser getWerewolfUser(String username) {
		return (WerewolfUser) userList.stream().filter(o -> username.equals(o.getUserName())).findAny().orElse(null);
	}

}
