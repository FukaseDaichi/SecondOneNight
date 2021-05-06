package com.boardgame.app.controller;

import java.util.List;

import javax.net.ssl.HttpsURLConnection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.boardgame.app.component.ApplicationInfoBeean;
import com.boardgame.app.entity.SocketInfo;
import com.boardgame.app.entity.werewolf.WerewolfRoom;
import com.boardgame.app.exception.ApplicationException;

@Controller
public class WereWolfController {

	@Autowired
	SimpMessagingTemplate simpMessagingTemplate;

	@Autowired
	private ApplicationInfoBeean appInfo;

	@SuppressWarnings("unchecked")
	@MessageMapping("werewolf-setrollregulation")
	public void werewolfSetRollRegulation(SocketInfo socketInfo) throws Exception {
		String description = "/topic/" + socketInfo.getRoomId();

		WerewolfRoom room = (WerewolfRoom) appInfo.getRoom(socketInfo.getRoomId());

		SocketInfo obj = null;
		if (room != null) {
			try {
				room.setRollRegulation((List<Integer>) socketInfo.getObj());

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

	@MessageMapping("werewolf-init")
	public void werewolfInit(SocketInfo socketInfo) throws Exception {
		String description = "/topic/" + socketInfo.getRoomId();

		WerewolfRoom room = (WerewolfRoom) appInfo.getRoom(socketInfo.getRoomId());
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

	@MessageMapping("werewolf-selectroll")
	public void werewolfSelectRoll(SocketInfo socketInfo) throws Exception {
		String description = "/topic/" + socketInfo.getRoomId();

		WerewolfRoom room = (WerewolfRoom) appInfo.getRoom(socketInfo.getRoomId());

		SocketInfo obj = null;
		if (room != null) {
			try {
				room.selectRoll(socketInfo.getUserName(), (Integer) socketInfo.getObj());

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

	@SuppressWarnings("unchecked")
	@MessageMapping("werewolf-discussionaction")
	public void werewolfDiscussionAction(SocketInfo socketInfo) throws Exception {
		String description = "/topic/" + socketInfo.getRoomId();

		WerewolfRoom room = (WerewolfRoom) appInfo.getRoom(socketInfo.getRoomId());

		SocketInfo obj = null;
		if (room != null) {
			try {
				room.discussionAction(socketInfo.getUserName(), (List<String>) socketInfo.getObj());

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

	@MessageMapping("werewolf-changeturn")
	public void werewolfChangeTurn(SocketInfo socketInfo) throws Exception {
		String description = "/topic/" + socketInfo.getRoomId();

		WerewolfRoom room = (WerewolfRoom) appInfo.getRoom(socketInfo.getRoomId());

		SocketInfo obj = null;
		if (room != null) {
			room.setTurn((Integer) socketInfo.getObj());

		} else {
			obj = new SocketInfo(HttpsURLConnection.HTTP_NOT_FOUND, "部屋が存在しません。部屋の作成をしてください", null);
			simpMessagingTemplate.convertAndSend(description, obj);
			return;
		}

		simpMessagingTemplate.convertAndSend(description, new SocketInfo(socketInfo.getStatus(), null, room));
	}

	@MessageMapping("werewolf-voting")
	public void werewolfVoiting(SocketInfo socketInfo) throws Exception {
		String description = "/topic/" + socketInfo.getRoomId();

		WerewolfRoom room = (WerewolfRoom) appInfo.getRoom(socketInfo.getRoomId());

		SocketInfo obj = null;
		if (room != null) {
			try {
				room.voting(socketInfo.getUserName(), (String) socketInfo.getObj());

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

}