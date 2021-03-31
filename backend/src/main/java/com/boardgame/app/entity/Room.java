package com.boardgame.app.entity;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import com.boardgame.app.exception.ApplicationException;

import lombok.Data;

@Data
public abstract class Room implements Serializable {

	private static final long serialVersionUID = -3706410290150472705L;

	protected int maxUserSize;

	protected String roomType;

	protected String roomId;

	protected List<User> userList;

	public void addUser(User user) throws ApplicationException {

		if (maxUserSize <= userList.size()) {
			throw new ApplicationException("部屋がいっぱいです");
		}

		if (userList == null) {
			userList = new ArrayList<User>();
		}

		// 既存ユーザ(同一名）がいるか確認
		if (userList.stream().filter(o -> o.getUserName().equals(user.getUserName())).findAny().orElse(null) == null) {
			userList.add(user);
			int userNo = userList.size();
			user.setUserNo(userNo);
			user.userId = roomId + "_" + userNo;
		} else {
			throw new ApplicationException("「" + user.getUserName() + "」の同一名ユーザが入室済みです");
		}
	}

	public abstract User joinUser(String userName) throws ApplicationException;

}
