package com.boardgame.app.controller;

import javax.net.ssl.HttpsURLConnection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.boardgame.app.component.ApplicationInfoBeean;
import com.boardgame.app.entity.Room;
import com.boardgame.app.entity.SocketInfo;
import com.boardgame.app.entity.User;
import com.boardgame.app.entity.chat.ChatRoom;
import com.boardgame.app.entity.enif.LimitTimeInterface;
import com.boardgame.app.exception.ApplicationException;

@Controller
public class GameController {

	@Autowired
	SimpMessagingTemplate simpMessagingTemplate;

	@Autowired
	private ApplicationInfoBeean appInfo;

	@MessageMapping("game-roomin")
	public void werewolfRoomIn(SocketInfo socketInfo) throws Exception {
		String description = "/topic/" + socketInfo.getRoomId();

		Room room = appInfo.getRoom(socketInfo.getRoomId());
		SocketInfo obj = null;
		if (room != null) {
			try {
				room.joinUser(socketInfo.getUserName());

			} catch (ApplicationException e) {
				obj = new SocketInfo(e.getStatus(), e.getMessage(), room);

				simpMessagingTemplate.convertAndSend(description, obj);
				return;
			}
		} else {
			obj = new SocketInfo(HttpsURLConnection.HTTP_NOT_FOUND, "部屋が存在しません。部屋の作成をしてください", null);
			simpMessagingTemplate.convertAndSend(description, obj);
			return;
		}

		simpMessagingTemplate.convertAndSend(description, new SocketInfo(socketInfo.getStatus(), null, room));
	}

	@MessageMapping("game-chat")
	public void chat(SocketInfo socketInfo) throws Exception {
		String description = "/topic/" + socketInfo.getRoomId();
		ChatRoom room = (ChatRoom) appInfo.getRoom(socketInfo.getRoomId());
		User user = room.getUserbyName(socketInfo.getUserName());
		room.chat(user, socketInfo.getMessage());

		SocketInfo rtnObj = new SocketInfo(socketInfo.getStatus(), null, room.getChatList());

		simpMessagingTemplate.convertAndSend(description, rtnObj);

	}

	@MessageMapping("game-setlimittime")
	public void setLimitTime(SocketInfo socketInfo) throws Exception {
		String description = "/topic/" + socketInfo.getRoomId();
		LimitTimeInterface room = (LimitTimeInterface) appInfo.getRoom(socketInfo.getRoomId());

		room.setLimitTime((Integer) socketInfo.getObj());

		SocketInfo rtnObj = new SocketInfo(socketInfo.getStatus(), null, room.getLimitTime());

		simpMessagingTemplate.convertAndSend(description, rtnObj);

	}

}