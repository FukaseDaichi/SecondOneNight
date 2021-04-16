package com.boardgame.app.constclass.hideout;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import com.boardgame.app.entity.hideout.BuildingCard;
import com.boardgame.app.entity.hideout.MemberCard;

public class HideoutConst {

	/**
	 * 1:スワット
	 * 2:テロリスト
	 */
	public static final int ROLL_SWAT = 1;
	public static final int ROLL_TERRORIST = 2;

	/**
	 * @param userSize 人数
	 * @return 役職リスト
	 */
	public static List<Integer> getRollArray(int userSize) {

		ArrayList<Integer> returnIntList = null;

		switch (userSize) {

		case 4:
			returnIntList = new ArrayList<>(Arrays.asList(ROLL_SWAT, ROLL_SWAT, ROLL_SWAT, ROLL_TERRORIST));
			break;

		case 5:
			returnIntList = new ArrayList<>(
					Arrays.asList(ROLL_SWAT, ROLL_SWAT, ROLL_SWAT, ROLL_TERRORIST, ROLL_TERRORIST));
			break;

		case 6:
			returnIntList = new ArrayList<>(
					Arrays.asList(ROLL_SWAT, ROLL_SWAT, ROLL_SWAT, ROLL_SWAT, ROLL_TERRORIST, ROLL_TERRORIST));
			break;

		}

		Collections.shuffle(returnIntList);
		return returnIntList;

	}

	/**
	 * 1:アジト
	 * 2:ダミー
	 * 3:爆弾
	 */
	public static final int BUILD_CARD_HIDEOUT = 1;
	public static final int BUILD_CARD_DUMMY = 2;
	public static final int BUILD_CARD_BOMB = 3;

	/**
	 * @param userSize 人数
	 * @return 建物カードリスト
	 */
	public static List<BuildingCard> getBuildingCardList(int userSize) {

		List<BuildingCard> buildingCardsList = new ArrayList<BuildingCard>();

		switch (userSize) {
		case 4:
			buildingCardsList.add(new BuildingCard(false, BUILD_CARD_HIDEOUT));
			buildingCardsList.add(new BuildingCard(false, BUILD_CARD_HIDEOUT));
			buildingCardsList.add(new BuildingCard(false, BUILD_CARD_DUMMY));
			buildingCardsList.add(new BuildingCard(false, BUILD_CARD_DUMMY));
			buildingCardsList.add(new BuildingCard(false, BUILD_CARD_BOMB));
			break;

		case 5:
			buildingCardsList.add(new BuildingCard(false, BUILD_CARD_HIDEOUT));
			buildingCardsList.add(new BuildingCard(false, BUILD_CARD_HIDEOUT));
			buildingCardsList.add(new BuildingCard(false, BUILD_CARD_HIDEOUT));
			buildingCardsList.add(new BuildingCard(false, BUILD_CARD_DUMMY));
			buildingCardsList.add(new BuildingCard(false, BUILD_CARD_DUMMY));
			buildingCardsList.add(new BuildingCard(false, BUILD_CARD_BOMB));
			break;

		case 6:
			buildingCardsList.add(new BuildingCard(false, BUILD_CARD_HIDEOUT));
			buildingCardsList.add(new BuildingCard(false, BUILD_CARD_HIDEOUT));
			buildingCardsList.add(new BuildingCard(false, BUILD_CARD_HIDEOUT));
			buildingCardsList.add(new BuildingCard(false, BUILD_CARD_DUMMY));
			buildingCardsList.add(new BuildingCard(false, BUILD_CARD_DUMMY));
			buildingCardsList.add(new BuildingCard(false, BUILD_CARD_DUMMY));
			buildingCardsList.add(new BuildingCard(false, BUILD_CARD_BOMB));
			break;
		}

		Collections.shuffle(buildingCardsList);
		return buildingCardsList;

	}

	/**
	 * -1:エキスパートスワット
	 *  0:スワット
	 *  1:テロリスト
	 *  2:エキスパートテロリスト
	 */
	public static final int MEMBER_CARD_SWATEX = -1;
	public static final int MEMBER_CARD_SWAT = 0;
	public static final int MEMBER_CARD_TERRORIST = 1;
	public static final int MEMBER_CARD_TERRORISTEX = 2;

	/**
	 * @param userSize 人数
	 * @return 隊員カード
	 */
	public static List<MemberCard> getMembersList(int userSize) {

		List<MemberCard> memberCardList = new ArrayList<MemberCard>();

		for (int i = 0; i < userSize * 2; i++) {
			memberCardList.add(new MemberCard(MEMBER_CARD_SWAT));
		}

		for (int i = 0; i < userSize; i++) {
			memberCardList.add(new MemberCard(MEMBER_CARD_SWATEX));
			memberCardList.add(new MemberCard(MEMBER_CARD_TERRORIST));
			memberCardList.add(new MemberCard(MEMBER_CARD_TERRORISTEX));
		}
		Collections.shuffle(memberCardList);
		return memberCardList;
	}

}
