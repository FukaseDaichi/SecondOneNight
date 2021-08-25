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
	private List<ArtData> artList;

	public FakeArtistRoom() {
		userList = new ArrayList<User>();
		turn = 0;
		gameTime = FakeArtistConst.TIME_FIRST;
		artList = new ArrayList<ArtData>();
		maxUserSize = 16;
	}

	/**
	 * 参加
	 */
	@Override
	public User joinUser(String userName) throws ApplicationException {
		// プレイ中の場合
		if (gameTime != FakeArtistConst.TIME_FIRST && gameTime != FakeArtistConst.TIME_END) {
			if (userList.stream().filter(o -> o.getUserName().equals(userName)).count() == 0) {
				throw new ApplicationException("プレイ中です");
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

		turn = 0;
		gameTime = FakeArtistConst.TIME_ART;
		artList = new ArrayList<ArtData>();
		theme = FakeArtistConst.getWord();

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

	public void drawing(String param, String username) throws ApplicationException {
		if (gameTime != FakeArtistConst.TIME_ART) {
			throw new ApplicationException("状況が変更しています。");
		}

		FakeArtistUser actionUser = getFakeArtistUser(username);
		if (!actionUser.isDrawFlg()) {
			throw new ApplicationException("お絵描きの手版じゃありません");
		}

		actionUser.setDrawFlg(false);
		turn++;

		ArtData artData = new ArtData();
		artData.setParam(param);
		artData.setUserName(username);
		artList.add(artData);

		if (turn >= userList.size() * 2) {
			gameTime = FakeArtistConst.TIME_DISCUSSION;
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

	@Override
	public void doOverLimit(int turn) throws ApplicationException {
		endDiscussion();
	}

	public void endDiscussion() throws ApplicationException {

		if (gameTime != FakeArtistConst.TIME_DISCUSSION) {
			throw new ApplicationException("状況が変更しています。");
		}
		gameTime = FakeArtistConst.TIME_END;
	}

	public void voting(String username, String targetUsername) throws ApplicationException {
		FakeArtistUser actionUser = getFakeArtistUser(username);

		if (turn != FakeArtistConst.TIME_VOTING) {
			throw new ApplicationException("投票中ではありません");
		}

		if (!actionUser.isVotingAbleFlg()) {
			throw new ApplicationException("すでに投票済みです。");
		}

		// 投票
		actionUser.setVotingAbleFlg(false);

		FakeArtistUser targetUser = getFakeArtistUser(targetUsername);
		targetUser.addCount();

		boolean endFlg = true;
		int maxVoting = 0;
		for (User user : userList) {
			FakeArtistUser fakeArtistUser = (FakeArtistUser) user;
			if (!fakeArtistUser.isVotingAbleFlg()) {
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
			for (User user : userList) {
				FakeArtistUser fakeArtistUser = (FakeArtistUser) user;
				if (fakeArtistUser.getVotingCount() == maxVoting) {
					fakeArtistUser.setPunishmentFlg(true);
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
