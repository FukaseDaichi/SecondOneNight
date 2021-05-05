package com.boardgame.app.entity.werewolf;

import java.util.ArrayList;
import java.util.List;

import com.boardgame.app.entity.User;
import com.boardgame.app.entity.chat.ChatRoom;
import com.boardgame.app.entity.enif.LimitTimeInterface;
import com.boardgame.app.exception.ApplicationException;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class WerewolfRoom extends ChatRoom implements LimitTimeInterface {
	private static final long serialVersionUID = 518425262409993402L;
	private int limitTime;
	private boolean selectRollTimeFlg;
	private List<WerewolfRoll> rollList;
	private WerewolfRoll firldRoll;

	/**
	 * 役職設定
	 * 役職増加時にはここを修正する
	 * @param rollNoList
	 * @throws ApplicationException
	 */
	public void setRollRegulation(List<Integer> rollNoList) throws ApplicationException {

		if(rollNoList.size() =< userList.size()) {

		}


		rollNoList.forEach((rollNo) -> {
			switch (rollNo) {
			case 1:
				break;
			}
		});
	}

	public WerewolfRoom() {
		maxUserSize = 8; //仮置き最大人数
		userList = new ArrayList<User>();
		limitTime = 0;
		selectRollTimeFlg = false;
		rollList = new ArrayList<WerewolfRoll>();
	}

	@Override
	public User joinUser(String userName) throws ApplicationException {
		User user = new WerwolfUser();
		user.setUserName(userName);
		addUser(user);
		return user;
	}

	@Override
	public void doOverLimit(int turn) throws ApplicationException {

	}

}
