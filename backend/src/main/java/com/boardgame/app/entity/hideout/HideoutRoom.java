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
	private List<MemberCard> memberFirldList;
	private BuildingCard firldBuilding;
	private List<Integer> waitUserIndexList;

	public HideoutRoom() {
		turn = 0;
		rushFlg = false;
		winnerTeam = 0;
		buildingCardList = new ArrayList<BuildingCard>();
		memberCardList = new ArrayList<MemberCard>();
		memberFirldList = new ArrayList<MemberCard>();
		waitUserIndexList = new ArrayList<Integer>();
		maxUserSize = 6;
	}

	public void init() throws ApplicationException {

		if (userList.size() < 4) {
			// 人数足りない
			throw new ApplicationException("人数が足りません");
		}

		maxUserSize = userList.size();
		turn = 1;
		rushFlg = false;
		winnerTeam = 0;
		buildingCardList = HideoutConst.getBuildingCardList(userList.size());
		memberCardList = HideoutConst.getMembersList(userList.size());
		memberFirldList = new ArrayList<MemberCard>();
		waitUserIndexList = new ArrayList<Integer>();

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
			user.setMemberCardList(new ArrayList<MemberCard>());
			user.setUserNo(i + 1);
			user.setUserRoleNo(rollList.get(i));
			user.setWaitUserIndexList(new ArrayList<Integer>());

			if (i == 0) {
				user.setTurnFlg(true);
			} else {
				user.setTurnFlg(false);
			}
		}
		// フィールドの建物を設定
		firldBuilding = buildingCardList.get(buildingCardList.size() - 1);
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
		getTargetWaitUserIndexList(buildingCardIndex).add(userIndex);

		// ターンユーザを次へ変更
		turnUser.setTurnFlg(false);
		int nextUserIndex = (userIndex + 1) % userList.size();
		((HideoutUser) userList.get(nextUserIndex)).setTurnFlg(true);

		// ラッシュフラグに応じて対応
		if (getTargetWaitUserIndexList(buildingCardIndex).size() > 3) {
			rushFlg = true;
			memberFirldList.clear();

			// 残りの隊員カードを取得
			List<MemberCard> resideList = memberCardList.stream().filter(o -> !o.isConsumeFlg())
					.collect(Collectors.toList());
			Collections.shuffle(resideList);
			int resideIndex = 0;

			for (Integer integer : getTargetWaitUserIndexList(buildingCardIndex)) {
				HideoutUser rushuUser = (HideoutUser) userList.get(integer);
				// 2枚の隊員カードを追加
				rushuUser.getMemberCardList().add(resideList.get(resideIndex));
				resideIndex++;

				rushuUser.getMemberCardList().add(resideList.get(resideIndex));
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

		BuildingCard targetBuilding = null;
		if (waitUserIndexList.size() > 3) {
			targetBuilding = firldBuilding;
		} else {
			for (User user : userList) {
				HideoutUser hideoutUser = (HideoutUser) user;
				if (hideoutUser.getWaitUserIndexList().size() > 3) {
					targetBuilding = hideoutUser.getBuildingCard();
				}
			}
		}

		if (targetBuilding == null) {
			throw new ApplicationException("対象の建物がありません");
		}

		List<Integer> targetWaitUserIndexList = getTargetWaitUserIndexList(targetBuilding.getNo());

		if (!targetWaitUserIndexList.contains(userIndex)) {
			throw new ApplicationException("対象のユーザじゃありません");
		}

		MemberCard card = memberCardList.stream().filter(o -> (o.getNo() == memberCardNo) && !o.isConsumeFlg())
				.findAny()
				.orElse(null);

		if (card == null) {
			throw new ApplicationException("対象の隊員カードがありません");
		}

		if (memberFirldList.stream().filter(o -> o.getHaveUserIndex() == userIndex)
				.count() >= targetWaitUserIndexList.stream().filter(o -> o == userIndex)
						.count()) {
			throw new ApplicationException("既に選択済みです");
		}

		// カード消費
		card.setConsumeFlg(true);

		// 所持ユーザ設定
		card.setHaveUserIndex(userIndex);

		memberFirldList.add(card);

		// 4枚集まった場合
		if (memberFirldList.size() > 3) {
			rushFlg = false;

			// 突入判定
			int sum = memberFirldList.stream().mapToInt(MemberCard::getCardType).sum();
			if (sum > 0) {
				judgment();
				// 突入失敗は処理なし
			} else {
				// 突入成功 すべてのカードがSWATの場合廃棄しない
				if (memberFirldList.stream().filter(o -> o.getCardType() == HideoutConst.MEMBER_CARD_SWAT)
						.count() > 3) {
					// 廃棄フラグをfalseにする
					memberFirldList.forEach(o -> o.setConsumeFlg(false));
				}

				// 建物公開
				targetBuilding.setOpenFlg(true);

				judgment();
				if(winnerTeam > 0) {
					return;
				}

				// 非公開建物のNoを取得
				List<Integer> resideBuildIntList = buildingCardList.stream().filter(o -> !o.isOpenFlg())
						.map(BuildingCard::getNo).collect(Collectors.toList());

				// シャッフル
				Collections.shuffle(resideBuildIntList);
				int index = 0;

				// 各ユーザに建物を再設定
				for (User user : userList) {
					HideoutUser hideoutUser = (HideoutUser) user;
					if (!hideoutUser.getBuildingCard().isOpenFlg()) {
						hideoutUser.setBuildingCard(buildingCardList.get(resideBuildIntList.get(index)));
						index++;
					}
				}

				if (!firldBuilding.isOpenFlg()) {
					firldBuilding = buildingCardList.get(resideBuildIntList.get(index));
				}

			}

			// 突入カードをクリア
			for (User user : userList) {
				HideoutUser hideoutUser = (HideoutUser) user;
				hideoutUser.getMemberCardList().clear();
			}

			// 待機メンバーリセット
			targetWaitUserIndexList.clear();
			turn++;

		}

	}

	@Override
	public User joinUser(String userName) throws ApplicationException {
		User user = new HideoutUser();
		user.setUserName(userName);
		addUser(user);
		return user;
	}

	/**
	 * 勝敗判定
	 */
	private void judgment() {

		// 爆弾が開いているか判定
		if (buildingCardList.stream().filter(o -> o.getCardType() == HideoutConst.BUILD_CARD_BOMB && o.isOpenFlg())
				.count() > 0) {
			winnerTeam = HideoutConst.ROLL_TERRORIST;
		} else if (buildingCardList.stream()
				// すべてのアジト壊滅判定
				.filter(o -> o.getCardType() == HideoutConst.BUILD_CARD_HIDEOUT && !o.isOpenFlg())
				.count() == 0) {
			winnerTeam = HideoutConst.ROLL_SWAT;
		} else if (memberCardList.stream().filter(o -> !o.isConsumeFlg()).count() < 8) {
			// 時間切れ判定
			winnerTeam = HideoutConst.ROLL_TERRORIST;
		}

		if (winnerTeam > 0) {
			// 全ての建物公開
			buildingCardList.forEach(o -> o.setOpenFlg(true));
		}
	}

	/**
	 * ターゲットビルディング取得
	 * @param buildingCardIndex
	 * @return
	 */
	private List<Integer> getTargetWaitUserIndexList(int buildingCardIndex) {

		// 各ユーザに建物を再設定
		for (User user : userList) {
			HideoutUser hideoutUser = (HideoutUser) user;
			if (hideoutUser.getBuildingCard().getNo() == buildingCardList.get(buildingCardIndex).getNo()) {
				return hideoutUser.getWaitUserIndexList();
			}
		}

		return this.waitUserIndexList;

	}
}
