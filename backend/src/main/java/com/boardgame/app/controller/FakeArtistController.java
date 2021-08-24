package com.boardgame.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.boardgame.app.component.ApplicationInfoBeean;
import com.boardgame.app.controller.common.CommonLogic;
import com.boardgame.app.entity.SocketInfo;
import com.boardgame.app.entity.fakeartist.FakeArtistRoom;

@Controller
public class FakeArtistController {

	@Autowired
	private SimpMessagingTemplate simpMessagingTemplate;

	@Autowired
	private ApplicationInfoBeean appInfo;

	@MessageMapping("fakeartist-init")
	public void fakeartistInit(SocketInfo socketInfo) {
		FakeArtistRoom room = (FakeArtistRoom) appInfo.getRoom(socketInfo.getRoomId());
		CommonLogic.actionHandler(() -> {
			room.init();
		}, room, simpMessagingTemplate, socketInfo);
	}

	@MessageMapping("fakeartist-drawing")
	public void fakeartistDrawing(SocketInfo socketInfo) {
		FakeArtistRoom room = (FakeArtistRoom) appInfo.getRoom(socketInfo.getRoomId());
		CommonLogic.actionHandler(() -> {
			room.drawing((String) socketInfo.getObj(), socketInfo.getUserName());
		}, room, simpMessagingTemplate, socketInfo);
	}

	@MessageMapping("fakeartist-voting")
	public void fakeartistVoting(SocketInfo socketInfo) {
		FakeArtistRoom room = (FakeArtistRoom) appInfo.getRoom(socketInfo.getRoomId());
		CommonLogic.actionHandler(() -> {
			room.voting(socketInfo.getUserName(), (String) socketInfo.getObj());
		}, room, simpMessagingTemplate, socketInfo);
	}

}
