package com.boardgame.app.entity;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import javax.net.ssl.HttpsURLConnection;

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

		if (userList == null) {
			userList = new ArrayList<User>();
		}

		// 既存ユーザ(同一名）がいるか確認
		if (userList.stream().filter(o -> o.getUserName().equals(user.getUserName())).findAny().orElse(null) == null) {

			// 入室可能か確認
			if (maxUserSize <= userList.size()) {
				throw new ApplicationException(HttpsURLConnection.HTTP_NOT_FOUND, "入室人数最大です。部屋を作り直してください。");
			}

			userList.add(user);
			int userNo = userList.size();
			user.setUserNo(userNo);
			user.userId = roomId + "_" + userNo;
		} else {
			throw new ApplicationException("「" + user.getUserName() + "」の同一名ユーザが入室済みです。同一ユーザとして入室します。");
		}

	}

	public abstract User joinUser(String userName) throws ApplicationException;

	public User getUserbyName(String userName) {
		// nullチェック
		if (userName == null || userList == null) {
			return null;
		}

		User user = userList.stream().filter(o -> userName.equals(o.getUserName())).findFirst().orElse(null);

		return user;
	}

	/**
	 * ユーザ削除
	 * 
	 * @param userName
	 */
	public void removeUser(String userName) {
		User user = getUserbyName(userName);
		if (user != null) {
			userList.remove(user);
		}
	}

}
