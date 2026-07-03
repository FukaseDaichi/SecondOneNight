package com.boardgame.app.entity.chat;

import java.io.Serializable;

import com.boardgame.app.entity.User;

import lombok.Data;

@Data
public class Chat implements Serializable {

	private static final long serialVersionUID = 6658885510597407367L;

	private User user;
	private String message;

	public Chat(User user, String message) {
		super();
		this.user = user;
		this.message = message;
	}

}
