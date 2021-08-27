package com.boardgame.app.controller;

import javax.net.ssl.HttpsURLConnection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.boardgame.app.component.ApplicationInfoBeean;
import com.boardgame.app.controller.common.CommonLogic;
import com.boardgame.app.entity.SocketInfo;
import com.boardgame.app.entity.fakeartist.ArtData;
import com.boardgame.app.entity.fakeartist.FakeArtistRoom;
import com.boardgame.app.exception.ApplicationException;

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
		String description = "/topic/" + socketInfo.getRoomId();
		try {
			if (room == null) {
				// err処理
				throw new Exception();
			}

			ArtData data = (ArtData) socketInfo.getObj();
			room.drawing(data, socketInfo.getUserName());

			if (data.isLastFlg()) {
				socketInfo.setObj(room);
			} else {
				socketInfo.setObj(data);
				socketInfo.setStatus(socketInfo.getStatus() + 1);
			}
			simpMessagingTemplate.convertAndSend(description, socketInfo);
		} catch (ApplicationException e) {
			socketInfo.setStatus(e.getStatus());
			socketInfo.setMessage(e.getMessage());
			simpMessagingTemplate.convertAndSend(description, socketInfo);
		} catch (Throwable e) {
			e.printStackTrace();
			socketInfo.setStatus(HttpsURLConnection.HTTP_NOT_FOUND);
			socketInfo.setMessage("部屋が存在しません。部屋の作成をしてください");
			simpMessagingTemplate.convertAndSend(description, socketInfo);

		}
	}

	@MessageMapping("fakeartist-voting")
	public void fakeartistVoting(SocketInfo socketInfo) {
		FakeArtistRoom room = (FakeArtistRoom) appInfo.getRoom(socketInfo.getRoomId());
		CommonLogic.actionHandler(() -> {
			room.voting(socketInfo.getUserName(), (String) socketInfo.getObj());
		}, room, simpMessagingTemplate, socketInfo);
	}

}
