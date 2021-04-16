package com.boardgame.app.entity.hideout;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import com.boardgame.app.constclass.hideout.HideoutConst;
import com.boardgame.app.entity.User;
import com.boardgame.app.entity.chat.ChatRoom;
import com.boardgame.app.exception.ApplicationException;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class HideoutRoom extends ChatRoom {
	private static final long serialVersionUID = 8079700566814884905L;

	private int turn;
	private List<BuildingCard> buildingCardList;
	private int winnerTeam;
	private List<MemberCard> memberCardList;
	private boolean rushFlg;

	public HideoutRoom() {
		turn = 0;
		rushFlg = false;
		winnerTeam = 0;
		buildingCardList = new ArrayList<BuildingCard>();
		memberCardList = new ArrayList<MemberCard>();
	}

	public void init() {
		turn = 1;
		rushFlg = false;
		winnerTeam = 0;
		buildingCardList = HideoutConst.getBuildingCardList(userList.size());
		memberCardList = HideoutConst.getMembersList(userList.size());

		// インデックスをふる
		for (int i = 0; i < buildingCardList.size(); i++) {
			buildingCardList.get(i).setNo(i);
		}

		for (int i = 0; i < memberCardList.size(); i++) {
			memberCardList.get(i).setNo(i);
		}

		List<Integer> rollList = HideoutConst.getRollArray(userList.size());

		// ユーザの順番変更
		Collections.shuffle(userList);

		for (int i = 0; i < userList.size(); i++) {
			HideoutUser user = (HideoutUser) userList.get(i);
			user.setBuildingCard(buildingCardList.get(i));
			user.setMemberCard(new ArrayList<MemberCard>());
			user.setUserNo(i + 1);
			user.setUserRoleNo(rollList.get(i));
			if (i == 0) {
				user.setTurnFlg(true);
			} else {
				user.setTurnFlg(false);
			}
		}
	}

	public void wait(int buildingCardIndex, int userIndex) throws ApplicationException {
		HideoutUser turnUser = (HideoutUser) userList.get(userIndex);

		if (!turnUser.isTurnFlg()) {
			// ターンユーザ外の動作
			throw new ApplicationException("ターンユーザではありません。");
		}

		if (rushFlg) {
			// 突入判定中
			throw new ApplicationException("突入判定中です。");
		}

		if (buildingCardList.get(buildingCardIndex).isOpenFlg()) {
			// 公開中です
			throw new ApplicationException("公開中のビルに突入してます。");
		}

		// 待機組に追加
		buildingCardList.get(buildingCardIndex).getWaitUserIndexList().add(userIndex);

		// ターンユーザを次へ変更
		turnUser.setTurnFlg(false);
		int nextUserIndex = (userIndex + 1) % userList.size();
		((HideoutUser) userList.get(nextUserIndex)).setTurnFlg(true);

		// ラッシュフラグに応じて対応
		if (buildingCardList.get(buildingCardIndex).getWaitUserIndexList().size() > 3) {
			rushFlg = true;

			// 残りの隊員カードを取得
			List<MemberCard> resideList = memberCardList.stream().filter(o -> !o.isConsumeFlg())
					.collect(Collectors.toList());
			Collections.shuffle(resideList);
			int resideIndex = 0;

			for (Integer integer : buildingCardList.get(buildingCardIndex).getWaitUserIndexList()) {
				HideoutUser rushuUser = (HideoutUser) userList.get(integer);
				// 2枚の隊員カードを追加
				rushuUser.getMemberCard().add(resideList.get(resideIndex));
				resideIndex++;

				rushuUser.getMemberCard().add(resideList.get(resideIndex));
				resideIndex++;
			}

		} else {
			// ターン経過
			turn++;
		}
	}

	public void rush(int userIndex, int memberCardNo) throws ApplicationException {

		if (!rushFlg) {
			throw new ApplicationException("突入判定中ではありません");
		}

		BuildingCard targetBuilding = buildingCardList.stream().filter(o -> o.getWaitUserIndexList().size() > 3)
				.findAny().orElse(null);

		if (targetBuilding == null) {
			throw new ApplicationException("対象の建物がありません");
		}

		if (!targetBuilding.getWaitUserIndexList().contains(userIndex)) {
			throw new ApplicationException("対象のユーザじゃありません");
		}

		MemberCard card = memberCardList.stream().filter(o -> (o.getNo() == userIndex) && !o.isConsumeFlg()).findAny()
				.orElse(null);

		if (card == null) {
			throw new ApplicationException("対象の隊員カードがありません");

		}
	}

	@Override
	public User joinUser(String userName) throws ApplicationException {
		User user = new HideoutUser();
		user.setUserName(userName);
		addUser(user);
		return user;
	}

	private List<MemberCard> getResideMembercard() {

		return null;
	}

}
