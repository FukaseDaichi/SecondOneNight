package com.boardgame.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.boardgame.app.component.ApplicationInfoBeean;
import com.boardgame.app.entity.Room;
import com.boardgame.app.entity.timebomb.RoomUserInfo;
import com.boardgame.app.entity.timebomb.TimeBombRoom;
import com.boardgame.app.exception.ApplicationException;
import com.boardgame.app.service.TimeBombService;

@Controller
public class TimeBombController {

	@Autowired
	SimpMessagingTemplate simpMessagingTemplate;

	@Autowired
	private TimeBombService timeBombService;

	@Autowired
	private ApplicationInfoBeean appInfo;

	@MessageMapping("/roomin")
	public void roomIn(RoomUserInfo userInfo) throws Exception {
		String description = "/topic/" + userInfo.getRoomId() + "/timebomb";

		Room room = appInfo.getRoom(userInfo.getRoomId());

		if (room != null) {
			try {
				room.joinUser(userInfo.getUserName());

			} catch (ApplicationException e) {
				e.printStackTrace();
				// 現状処理なし
			}
		}

		simpMessagingTemplate.convertAndSend(description, room);
	}

	@MessageMapping("/start")
	public void start(RoomUserInfo userInfo) throws Exception {
		String description = "/topic/" + userInfo.getRoomId() + "/timebomb";

		TimeBombRoom room = (TimeBombRoom) appInfo.getRoom(userInfo.getRoomId());

		if (room != null) {
			room.init();

		} else {
			throw new ApplicationException("部屋がありません");
		}

		simpMessagingTemplate.convertAndSend(description, room);
	}

}