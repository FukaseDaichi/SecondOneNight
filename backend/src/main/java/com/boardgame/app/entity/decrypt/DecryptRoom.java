package com.boardgame.app.entity.decrypt;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.boardgame.app.constclass.decrypt.DecryptConst;
import com.boardgame.app.entity.User;
import com.boardgame.app.entity.chat.ChatRoom;
import com.boardgame.app.exception.ApplicationException;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class DecryptRoom extends ChatRoom {

	private static final long serialVersionUID = 807970056684884905L;

	private int turn;
	private int gameTime;
	private int choiceMode;
	private int maxTurn;
	private int winnerTeam;
	private TeamData leftTeam;
	private TeamData rightTeam;

	public DecryptRoom() {
		userList = new ArrayList<User>();
		turn = 0;
		choiceMode = DecryptConst.CHOICE_MODE_RANDOM;
		gameTime = DecryptConst.TIME_FIRST;
		maxTurn = 10;
		winnerTeam = 0;
		maxUserSize = 16;
		leftTeam = new TeamData();
		rightTeam = new TeamData();
	}

	public void resetCode() throws ApplicationException {
		if (gameTime != DecryptConst.TIME_FIRST && gameTime != DecryptConst.TIME_END) {
			throw new ApplicationException("ゲーム中はリセットできません");
		}
	}

	public void resetTeam() throws ApplicationException {

		if (gameTime != DecryptConst.TIME_FIRST && gameTime != DecryptConst.TIME_END) {
			throw new ApplicationException("ゲーム中はリセットできません");
		}

		Collections.shuffle(userList);
		for (int i = 0; i < userList.size(); i++) {
			DecryptUser decryptUser = (DecryptUser) userList.get(i);

			// 偶数奇数でチーム割
			if (i % 2 == 0) {
				decryptUser.setTeamNo(DecryptConst.TEAM_NO_LEFT);
			} else {
				decryptUser.setTeamNo(DecryptConst.TEAM_NO_RIGHT);
			}
		}
	}

	public void choiceTeam(String userName, int teamNo) throws ApplicationException {
		DecryptUser user = getDecryptUser(userName);

		if (user == null) {
			throw new ApplicationException("ユーザがいません");
		}

		// ユーザのチーム設定
		user.setTeamNo(teamNo);
	}

	public void init() throws ApplicationException {
		turn = 0;
		leftTeam = new TeamData();
		rightTeam = new TeamData();

		// 手番設定
		leftTeam.setTebanFlg(true);

		// 暗号設定
		leftTeam.addTurnData(DecryptConst.createCode());

		switch (choiceMode) {
		case DecryptConst.CHOICE_MODE_HANDSUP:
			gameTime = DecryptConst.TIME_DECISTION;
			break;

		case DecryptConst.CHOICE_MODE_RANDOM:
			gameTime = DecryptConst.TIME_CREATE;
		}
	}

	private void randomCryptUserChoice() {
		if (turn % 2 == 0) {

		}
	}

	public void createCodeWord(int teamNo, List<String> codeWordList) throws ApplicationException {
		TurnData turnData = getTeamData(teamNo).getLatestTurnData();

		if (gameTime != DecryptConst.TIME_CREATE) {
			throw new ApplicationException("暗号作成中の時間ではありません");
		}

		if (turnData.getCryptWotdList() == null) {
			throw new ApplicationException("設定済みです");
		}
		// 設定
		turnData.setCryptWotdList(codeWordList);

	}

	@Override
	public User joinUser(String userName) throws ApplicationException {
		User user = new DecryptUser();
		user.setUserName(userName);
		addUser(user);
		return user;
	}

	public void removeUser(String userName) {
		User user = getDecryptUser(userName);
		if (user != null) {
			userList.remove(user);
		}
	}

	private TeamData getTeamData(int teamNo) {
		return teamNo == DecryptConst.TEAM_NO_LEFT ? leftTeam : rightTeam;
	}

	public DecryptUser getDecryptUser(String username) {
		return (DecryptUser) userList.stream().filter(o -> username.equals(o.getUserName())).findAny().orElse(null);
	}

}
