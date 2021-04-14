package com.boardgame.app.entity.werewolf;

import java.util.ArrayList;

import com.boardgame.app.entity.User;
import com.boardgame.app.entity.chat.ChatRoom;
import com.boardgame.app.exception.ApplicationException;

public class WerewolfRoom extends ChatRoom {

	private static final long serialVersionUID = 518425262409993402L;

	public WerewolfRoom() {
		maxUserSize = 8;
		userList = new ArrayList<User>();
	}

	@Override
	public User joinUser(String userName) throws ApplicationException {
		User user = new WerwolfUser();
		user.setUserName(userName);
		addUser(user);
		return user;
	}

}
