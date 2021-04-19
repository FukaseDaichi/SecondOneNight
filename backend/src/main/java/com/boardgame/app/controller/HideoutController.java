package com.boardgame.app.controller;

import javax.net.ssl.HttpsURLConnection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.boardgame.app.component.ApplicationInfoBeean;
import com.boardgame.app.entity.SocketInfo;
import com.boardgame.app.entity.User;
import com.boardgame.app.entity.hideout.HideoutRoom;
import com.boardgame.app.exception.ApplicationException;

@Controller
public class HideoutController {

	@Autowired
	SimpMessagingTemplate simpMessagingTemplate;

	@Autowired
	private ApplicationInfoBeean appInfo;

	@MessageMapping("hideout-init")
	public void hideoutInit(SocketInfo socketInfo) throws Exception {
		String description = "/topic/" + socketInfo.getRoomId();

		HideoutRoom room = (HideoutRoom) appInfo.getRoom(socketInfo.getRoomId());
		SocketInfo obj = null;
		if (room != null) {
			try {
				room.init();

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

	@MessageMapping("hideout-wait")
	public void hideoutwait(SocketInfo socketInfo) throws Exception {
		String description = "/topic/" + socketInfo.getRoomId();

		HideoutRoom room = (HideoutRoom) appInfo.getRoom(socketInfo.getRoomId());
		if (room != null) {
			User user = room.getUserbyName(socketInfo.getUserName());

			try {
				room.wait((Integer) socketInfo.getObj(), user.getUserNo() - 1);
			} catch (ApplicationException e) {
				e.printStackTrace();
				return;
			}
		} else {
			SocketInfo obj = new SocketInfo(HttpsURLConnection.HTTP_NOT_FOUND, "部屋が存在しません。部屋の作成をしてください", null);
			simpMessagingTemplate.convertAndSend(description, obj);
			return;
		}

		SocketInfo rtnObj = new SocketInfo(socketInfo.getStatus(), null, room.getChatList());

		simpMessagingTemplate.convertAndSend(description, rtnObj);

	}

	@MessageMapping("hideout-rush")
	public void hideoutrush(SocketInfo socketInfo) throws Exception {
		String description = "/topic/" + socketInfo.getRoomId();

		HideoutRoom room = (HideoutRoom) appInfo.getRoom(socketInfo.getRoomId());
		if (room != null) {
			User user = room.getUserbyName(socketInfo.getUserName());

			try {
				room.rush(user.getUserNo() - 1, (Integer) socketInfo.getObj());
			} catch (ApplicationException e) {
				e.printStackTrace();
				return;
			}
		} else {
			SocketInfo obj = new SocketInfo(HttpsURLConnection.HTTP_NOT_FOUND, "部屋が存在しません。部屋の作成をしてください", null);
			simpMessagingTemplate.convertAndSend(description, obj);
			return;
		}

		SocketInfo rtnObj = new SocketInfo(socketInfo.getStatus(), null, room.getChatList());

		simpMessagingTemplate.convertAndSend(description, rtnObj);

	}

}