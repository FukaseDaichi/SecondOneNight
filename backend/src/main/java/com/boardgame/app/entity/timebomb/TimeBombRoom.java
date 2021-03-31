package com.boardgame.app.entity.timebomb;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import com.boardgame.app.constclass.timebomb.TimeBombConst;
import com.boardgame.app.entity.Room;
import com.boardgame.app.entity.User;
import com.boardgame.app.exception.ApplicationException;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class TimeBombRoom extends Room {
	private static final long serialVersionUID = 6252639126815391708L;
	private int turn;
	private List<LeadCards> leadCardsList;

	public void init() {
		// ターンの初期化
		turn = 1;

		// ユーザの初期化
		int userSize = userList.size();
		maxUserSize = userSize;

		// 役職取得
		List<Integer> userTypeList = TimeBombConst.getUserList(userSize);

		// 手番ユーザの乱数生成
		Random rand = new Random();
		int turnUserNo = rand.nextInt(userSize);

		for (int i = 0; i < userSize; i++) {
			TimeBombUser timeBombUser = (TimeBombUser) userList.get(i);

			timeBombUser.setUserNo(i + 1);

			timeBombUser.setUserRoleNo(userTypeList.get(i));

			if (turnUserNo == i) {
				timeBombUser.setTurnFlg(true);
			} else {
				timeBombUser.setTurnFlg(false);
			}
		}

		// カードの初期化
		List<Integer> cardsTypeList = TimeBombConst.getCardsList(userSize);
		leadCardsList = new ArrayList<LeadCards>();
		for (Integer integer : cardsTypeList) {
			leadCardsList.add(new LeadCards(integer));
		}

	}

	@Override
	public User joinUser(String userName) throws ApplicationException {
		User user = new TimeBombUser();
		user.setUserName(userName);
		addUser(user);
		return user;
	}

	public int playTurn(int cardIndex) throws ApplicationException {
		// エラーチェック
		if (leadCardsList.get(cardIndex).isOpenFlg()) {
			throw new ApplicationException("対象カードなし");
		}

		// 実行
		leadCardsList.get(cardIndex).setOpenFlg(true);
		turn++;

		// 手番ユーザの決定
		int turnUserNo = (cardIndex) / 5;

		for (int i = 0; i < userList.size(); i++) {
			TimeBombUser timeBombUser = (TimeBombUser) userList.get(i);

			if (turnUserNo == i) {
				timeBombUser.setTurnFlg(true);
			} else {
				timeBombUser.setTurnFlg(false);
			}
		}

		return judgment();
	}

	/**
	 * 0:勝敗なし
	 * @return
	 */
	private int judgment() {
		int result = 0;

		if (leadCardsList.stream().filter(o -> (o.getCardType() == TimeBombConst.BOMB_CARD_NO) && o.isOpenFlg())
				.count() > 0) {
			// 爆弾が爆発した場合
			result = TimeBombConst.BOMB_TEAM;
		} else if (leadCardsList.stream()
				.filter(o -> o.getCardType() == TimeBombConst.RELEASE_CARD_NO && o.isOpenFlg())
				.count() >= maxUserSize) {
			// 解除成功
			result = TimeBombConst.TIME_POLIS;
		} else if (turn > leadCardsList.size()) {
			// 時間切れ
			result = TimeBombConst.BOMB_TEAM;
		}

		return result;
	}

}
