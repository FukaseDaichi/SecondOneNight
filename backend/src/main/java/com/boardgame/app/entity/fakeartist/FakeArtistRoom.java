package com.boardgame.app.entity.fakeartist;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

import com.boardgame.app.constclass.SystemConst;
import com.boardgame.app.constclass.fakeartist.FakeArtistConst;
import com.boardgame.app.entity.User;
import com.boardgame.app.entity.chat.ChatRoom;
import com.boardgame.app.entity.enif.LimitTimeInterface;
import com.boardgame.app.exception.ApplicationException;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class FakeArtistRoom extends ChatRoom implements LimitTimeInterface {

	private static final long serialVersionUID = 807970056684884905L;
	private int limitTime;
	private String theme;
	private int turn;
	private int gameTime;
	private List<ArtDataStroke> artDataStrokeList;
	private int rurleNo;
	private String endMessage;
	private List<Integer> patternList;

	public FakeArtistRoom() {
		userList = new ArrayList<User>();
		turn = 0;
		gameTime = FakeArtistConst.TIME_FIRST;
		artDataStrokeList = new ArrayList<ArtDataStroke>();
		maxUserSize = 16;
		patternList = new ArrayList<Integer>();
		patternList.add(5);
		rurleNo = 0;
	}

	/**
	 * 参加
	 */
	@Override
	public User joinUser(String userName) throws ApplicationException {
		// プレイ中の場合
		if (gameTime != FakeArtistConst.TIME_FIRST && gameTime != FakeArtistConst.TIME_END) {
			if (userList.stream().filter(o -> o.getUserName().equals(userName)).count() == 0) {
				throw new ApplicationException(SystemConst.ERR_MSG_OWNVIEW_STATUS_CODE, "プレイ中です");
			}
		}
		User user = new FakeArtistUser();
		user.setUserName(userName);
		addUser(user);
		return user;
	}

	/**
	 * 開始
	 * 
	 * @throws ApplicationException
	 */
	public void init() throws ApplicationException {

		// 役職設定確認
		if (userList.size() < 3) {
			throw new ApplicationException(SystemConst.ERR_MSG_ALLVIEW_STATUS_CODE, "参加者が少ないため開始できません");
		}

		// 役職設定確認
		if (patternList.isEmpty()) {
			throw new ApplicationException(SystemConst.ERR_MSG_OWNVIEW_STATUS_CODE, "テーマの種類を設定してください。");
		}

		turn = 0;
		endMessage = null;
		gameTime = FakeArtistConst.TIME_ART;
		artDataStrokeList = new ArrayList<ArtDataStroke>();
		theme = FakeArtistConst.getWord(patternList);

		// ユーザ設定
		Collections.shuffle(userList);

		Random rand = new Random();
		Integer randNo = rand.nextInt(userList.size());
		for (int i = 0; i < userList.size(); i++) {
			FakeArtistUser fakeArtistUser = (FakeArtistUser) userList.get(i);
			fakeArtistUser.setUserNo(i);
			fakeArtistUser.setVotingCount(0);

			// 役職設定
			if (i == randNo) {
				fakeArtistUser.setRollNo(FakeArtistConst.ROLL_FAKE);
			} else {
				fakeArtistUser.setRollNo(FakeArtistConst.ROLL_ARTIST);
			}

			// お絵描きフラグの設定
			if (i == 0) {
				fakeArtistUser.setDrawFlg(true);
			} else {
				fakeArtistUser.setDrawFlg(false);
			}

			fakeArtistUser.setVotingAbleFlg(true);
			fakeArtistUser.setPunishmentFlg(false);
		}

	}

	public void drawing(ArtDataStroke artData, String username) throws ApplicationException {

		// 多かった場合先頭要素削除
		if (artDataStrokeList.size() > 1000) {
			artDataStrokeList = artDataStrokeList.subList(100, artDataStrokeList.size());
		}

		if (gameTime == FakeArtistConst.TIME_FIRST || gameTime == FakeArtistConst.TIME_END) {
			artDataStrokeList.add(artData);
			return;
		}

		if (gameTime != FakeArtistConst.TIME_ART) {
			throw new ApplicationException(SystemConst.ERR_MSG_NONVIW_STATUS_CODE, "状況が変更しています。");
		}

		FakeArtistUser actionUser = getFakeArtistUser(username);
		if (!actionUser.isDrawFlg()) {
			throw new ApplicationException(SystemConst.ERR_MSG_NONVIW_STATUS_CODE, "お絵描きの手版じゃありません");
		}

		artDataStrokeList.add(artData);
		// 最後の場合
		if (artData.isEndFlg()) {
			actionUser.setDrawFlg(false);
			turn++;

			if (turn >= userList.size() * 2) {
				gameTime = FakeArtistConst.TIME_DISCUSSION;

				for (int i = 0; i < userList.size(); i++) {
					FakeArtistUser fakeArtistUser = (FakeArtistUser) userList.get(i);
					// お絵描きフラグの設定
					fakeArtistUser.setDrawFlg(false);
				}
			} else {
				int nextUserNo = turn % userList.size();

				for (int i = 0; i < userList.size(); i++) {
					FakeArtistUser fakeArtistUser = (FakeArtistUser) userList.get(i);
					// お絵描きフラグの設定
					if (i == nextUserNo) {
						fakeArtistUser.setDrawFlg(true);
					}
				}
			}
		}

	}

	@Override
	public void doOverLimit(int turn) throws ApplicationException {
		endDiscussion();
	}

	public void endDiscussion() throws ApplicationException {

		if (gameTime != FakeArtistConst.TIME_DISCUSSION) {
			throw new ApplicationException(SystemConst.ERR_MSG_NONVIW_STATUS_CODE, "状況が変更しています。");
		}
		gameTime = FakeArtistConst.TIME_VOTING;
	}

	public void voting(String username, String targetUsername) throws ApplicationException {
		FakeArtistUser actionUser = getFakeArtistUser(username);

		if (gameTime != FakeArtistConst.TIME_VOTING) {
			throw new ApplicationException(SystemConst.ERR_MSG_NONVIW_STATUS_CODE, "投票中ではありません");
		}

		if (!actionUser.isVotingAbleFlg()) {
			throw new ApplicationException(SystemConst.ERR_MSG_NONVIW_STATUS_CODE, "すでに投票済みです。");
		}

		// 投票
		actionUser.setVotingAbleFlg(false);

		FakeArtistUser targetUser = getFakeArtistUser(targetUsername);
		targetUser.addCount();

		boolean endFlg = true;
		int maxVoting = 0;
		for (User user : userList) {
			FakeArtistUser fakeArtistUser = (FakeArtistUser) user;
			if (fakeArtistUser.isVotingAbleFlg()) {
				endFlg = false;
			}
			if (fakeArtistUser.getVotingCount() > maxVoting) {
				maxVoting = fakeArtistUser.getVotingCount();
			}
		}

		// 終了時
		if (endFlg) {
			gameTime = FakeArtistConst.TIME_END;
			// 処刑とする。
			int sameNoCount = 0;
			endMessage = "エセ芸術家の勝利！";
			for (User user : userList) {
				FakeArtistUser fakeArtistUser = (FakeArtistUser) user;
				fakeArtistUser.setDrawFlg(true);
				if (fakeArtistUser.getVotingCount() == maxVoting) {
					fakeArtistUser.setPunishmentFlg(true);
					if (fakeArtistUser.getRollNo() == FakeArtistConst.ROLL_FAKE) {
						endMessage = "エセ芸術家は何がテーマか当てよう！";
					}
					sameNoCount++;
				}
			}

			if (rurleNo == 0 && sameNoCount > 1) {
				// 処刑なし
				endMessage = "同票のため、エセ芸術家の勝利！";
				for (User user : userList) {
					FakeArtistUser fakeArtistUser = (FakeArtistUser) user;
					fakeArtistUser.setPunishmentFlg(false);
				}
			}
		}
	}

	/**
	 * ユーザ取得
	 * 
	 * @param userName
	 * @return FakeArtistUser
	 */
	public FakeArtistUser getFakeArtistUser(String userName) {
		return (FakeArtistUser) userList.stream().filter(o -> userName.equals(o.getUserName())).findAny().orElse(null);
	}

}
