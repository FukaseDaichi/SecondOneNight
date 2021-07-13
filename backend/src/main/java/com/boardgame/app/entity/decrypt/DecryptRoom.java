package com.boardgame.app.entity.decrypt;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

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

	/**
	 * 暗号リセット
	 * @throws ApplicationException
	 */
	public void resetCode() throws ApplicationException {
		if (gameTime != DecryptConst.TIME_FIRST && gameTime != DecryptConst.TIME_END) {
			throw new ApplicationException("ゲーム中はリセットできません");
		}

		List<String> codeDataList = DecryptConst.getCodeArray();

		leftTeam.setCodeWordList(codeDataList.subList(0, 4));
		rightTeam.setCodeWordList(codeDataList.subList(4, 8));

	}

	/**
	 * チームリセット
	 * @throws ApplicationException
	 */
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

	/**
	 * チーム参加
	 * @param userName
	 * @param teamNo
	 * @throws ApplicationException
	 */
	public void choiceTeam(String userName, int teamNo) throws ApplicationException {
		DecryptUser user = getDecryptUser(userName);

		if (user == null) {
			throw new ApplicationException("ユーザがいません");
		}

		// ユーザのチーム設定
		user.setTeamNo(teamNo);
	}

	/**
	 * 開始
	 * @throws ApplicationException
	 */
	public void init() throws ApplicationException {
		turn = 0;
		leftTeam = new TeamData();
		rightTeam = new TeamData();

		// 暗号作成者なし;
		cryptUserReset();

		// 手番設定
		leftTeam.setTebanFlg(true);

		// 暗号設定
		leftTeam.addTurnData(DecryptConst.createCode());

		switch (choiceMode) {
		case DecryptConst.CHOICE_MODE_HANDSUP:
			gameTime = DecryptConst.TIME_DECISTION;
			break;

		case DecryptConst.CHOICE_MODE_RANDOM:
			randomCryptUserChoice();
			gameTime = DecryptConst.TIME_CREATE;
		}
	}

	/**
	 * 暗号作成
	 * @param userName
	 * @param codeWordList
	 * @throws ApplicationException
	 */
	public void createCodeWord(String userName, List<String> codeWordList) throws ApplicationException {
		DecryptUser user = getDecryptUser(userName);

		if (!user.isCryptUserFlg()) {
			throw new ApplicationException("暗号作成者ではありません");
		}

		if (gameTime != DecryptConst.TIME_CREATE) {
			throw new ApplicationException("暗号作成中の時間ではありません");
		}
		if (codeWordList.stream().filter(o -> o.isEmpty()).count() != 0) {
			throw new ApplicationException("設定してください");
		}

		TurnData turnData = getTeamData(user.getTeamNo()).getLatestTurnData();

		if (turnData.getCryptWotdList() == null || turnData.getCryptCodeList().isEmpty()) {
			throw new ApplicationException("設定済みです");
		}

		// 設定
		turnData.setCryptWotdList(codeWordList);
		gameTime = DecryptConst.TIME_DECRYPT;
	}

	/**
	 * 暗号解読
	 * @param userName
	 * @param codeList
	 * @throws ApplicationException
	 */
	public void decryptCode(String userName, List<Integer> codeList) throws ApplicationException {
		DecryptUser user = getDecryptUser(userName);

		if (user.isCryptUserFlg()) {
			throw new ApplicationException("暗号解読者ではありません");
		}

		if (gameTime != DecryptConst.TIME_DECRYPT) {
			throw new ApplicationException("暗号解読の時間ではありません");
		}

		int decryptTeamNo = turn % 2 == 0 ? DecryptConst.TEAM_NO_LEFT : DecryptConst.TEAM_NO_RIGHT;

		TurnData turnData = getTeamData(decryptTeamNo).getLatestTurnData();

		int userTeamNo = user.getTeamNo();

		if (userTeamNo == decryptTeamNo) {

			if (turnData.getDecryptList() != null) {
				throw new ApplicationException("設定済みです。");
			}

			turnData.setCryptCodeList(codeList);

		} else {
			if (turnData.getOpponentDecryptList() != null) {
				throw new ApplicationException("設定済みです。");
			}
			turnData.setOpponentDecryptList(codeList);
		}

		if (turnData.getDecryptList() != null && turnData.getOpponentDecryptList() != null) {
		}

	}

	/**
	 * 参加
	 */
	@Override
	public User joinUser(String userName) throws ApplicationException {
		User user = new DecryptUser();
		user.setUserName(userName);
		addUser(user);
		return user;
	}

	/**
	 * ユーザ削除
	 * @param userName
	 */
	public void removeUser(String userName) {
		User user = getDecryptUser(userName);
		if (user != null) {
			userList.remove(user);
		}
	}

	/**
	 * ユーザ取得
	 * @param username
	 * @return
	 */
	public DecryptUser getDecryptUser(String userName) {
		return (DecryptUser) userList.stream().filter(o -> userName.equals(o.getUserName())).findAny().orElse(null);
	}

	/**
	 * チーム取得
	 * @param teamNo
	 * @return
	 */
	private TeamData getTeamData(int teamNo) {
		return teamNo == DecryptConst.TEAM_NO_LEFT ? leftTeam : rightTeam;
	}

	/**
	 * ランダムに暗号作成者を決定する
	 */
	private void randomCryptUserChoice() {
		cryptUserReset();

		int teamNo = turn % 2 == 0 ? DecryptConst.TEAM_NO_LEFT : DecryptConst.TEAM_NO_RIGHT;
		int teamCount = 0;
		for (User user : userList) {
			DecryptUser decryptUser = (DecryptUser) user;
			if (decryptUser.getTeamNo() == teamNo) {
				teamCount++;
			}
		}
		Random rand = new Random();
		int randomNumber = rand.nextInt(teamCount);

		int count = 0;
		for (User user : userList) {
			DecryptUser decryptUser = (DecryptUser) user;
			if (decryptUser.getTeamNo() == teamNo) {
				if (count == randomNumber) {
					decryptUser.setCryptUserFlg(true);
				}
				count++;
			}
		}
	}

	/**
	 * 全ユーザの暗号作成者をリセットする
	 */
	private void cryptUserReset() {
		for (User user : userList) {
			DecryptUser decryptUser = (DecryptUser) user;
			decryptUser.setCryptUserFlg(false);
		}
	}

}
