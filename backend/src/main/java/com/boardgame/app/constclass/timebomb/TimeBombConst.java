package com.boardgame.app.constclass.timebomb;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class TimeBombConst {

	public static final String ROOM_TYPE = "TIMEBOMB";
	public static final int DEFAULT_MAXUSERSIZE = 8;

	/**
	 * 1:時空警察
	 * 2:ボマーチーム
	 * 3:スパイ
	 */
	public static final int TIME_POLIS = 1;
	public static final int BOMB_TEAM = 2;
	public static final int SPY = 3;

	/**
	 * 1:解除
	 * 2:BOOM
	 * 3:し〜ん
	 */
	public static final int RELEASE_CARD_NO = 1;
	public static final int BOMB_CARD_NO = 2;
	public static final int COMMON_CARD_NO = 3;

	public static List<Integer> getCardsList(int userSize) {

		ArrayList<Integer> returnIntList = null;

		switch (userSize) {
		case 3:
			returnIntList = new ArrayList<>(Arrays.asList(1, 1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3));
			break;

		case 4:
			returnIntList = new ArrayList<>(Arrays.asList(1, 1, 1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3));
			break;

		case 5:
			returnIntList = new ArrayList<>(
					Arrays.asList(1, 1, 1, 1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3));
			break;

		case 6:
			returnIntList = new ArrayList<>(
					Arrays.asList(1, 1, 1, 1, 1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
							3));
			break;

		case 7:
			returnIntList = new ArrayList<>(
					Arrays.asList(1, 1, 1, 1, 1, 1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
							3, 3, 3, 3, 3, 3));
			break;

		case 8:
			returnIntList = new ArrayList<>(
					Arrays.asList(1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
							3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3));
			break;
		}

		Collections.shuffle(returnIntList);
		return returnIntList;
	}

	public static List<Integer> getUserList(int userSize) {
		ArrayList<Integer> returnIntList = null;
		switch (userSize) {
		case 3:
			returnIntList = new ArrayList<>(Arrays.asList(1, 1, 2, 2));
			Collections.shuffle(returnIntList);
			// 先頭要素削除
			returnIntList.remove(0);
			break;
		case 4:
			returnIntList = new ArrayList<>(Arrays.asList(1, 1, 1, 2, 2));
			Collections.shuffle(returnIntList);
			// 先頭要素削除
			returnIntList.remove(0);
			break;
		case 5:
			returnIntList = new ArrayList<>(Arrays.asList(1, 1, 1, 2, 2));
			Collections.shuffle(returnIntList);
			break;

		case 6:
			returnIntList = new ArrayList<>(Arrays.asList(1, 1, 1, 1, 2, 2));
			Collections.shuffle(returnIntList);
			break;

		case 7:
			returnIntList = new ArrayList<>(Arrays.asList(1, 1, 1, 1, 2, 2, 2));
			Collections.shuffle(returnIntList);
			// 先頭要素削除
			returnIntList.remove(0);
			break;

		case 8:
			returnIntList = new ArrayList<>(Arrays.asList(1, 1, 1, 1, 2, 2, 2));
			Collections.shuffle(returnIntList);
			break;
		}

		return returnIntList;

	}

}
