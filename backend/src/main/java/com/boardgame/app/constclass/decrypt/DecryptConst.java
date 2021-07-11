package com.boardgame.app.constclass.decrypt;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class DecryptConst {

	public static final String ROOM_TYPE = "DECRYPT";

	public static final int CHOICE_MODE_HANDSUP = 0;
	public static final int CHOICE_MODE_RANDOM = 1;

	/**
	 * 1:レフト 2:ライト
	 */
	public static final int TEAM_NO_LEFT = 1;
	public static final int TEAM_NO_RIGHT = 2;

	/**
	 * 0:初期状態 1:暗号作成者決定中 2:暗号作成中 3:暗号解読中 4:ゲーム終了
	 */
	public static final int TIME_FIRST = 0;
	public static final int TIME_DECISTION = 1;
	public static final int TIME_CREATE = 2;
	public static final int TIME_DECRYPT = 3;
	public static final int TIME_END = 4;

	public static List<String> getCodeArray() {

		return null;
	}

	public static List<Integer> createCode() {
		List<Integer> resultList = new ArrayList<Integer>(Arrays.asList(1, 2, 3, 4));
		Collections.shuffle(resultList);
		resultList.remove(0);

		return resultList;
	}

}
