package com.boardgame.app.entity.chat;

import java.util.ArrayList;
import java.util.List;

import com.boardgame.app.constclass.timebomb.SystemConst;
import com.boardgame.app.entity.Room;
import com.boardgame.app.entity.User;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public abstract class ChatRoom extends Room {

	private static final long serialVersionUID = 1737124460037880891L;

	protected List<Chat> chatList;

	public ChatRoom() {
		chatList = new ArrayList<Chat>();
	}

	public void chat(User user, String message) {
		chatList.add(new Chat(user, message));

		// 最大部屋数超過防止
		if (chatList.size() > SystemConst.MAX_CHATSIZE) {
			chatList.remove(0);
		}
	}

}
