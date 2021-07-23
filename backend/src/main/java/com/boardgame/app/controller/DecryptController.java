package com.boardgame.app.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.boardgame.app.component.ApplicationInfoBeean;
import com.boardgame.app.controller.common.CommonLogic;
import com.boardgame.app.entity.SocketInfo;
import com.boardgame.app.entity.decrypt.DecryptRoom;

@Controller
public class DecryptController {

	@Autowired
	private SimpMessagingTemplate simpMessagingTemplate;

	@Autowired
	private ApplicationInfoBeean appInfo;

	@MessageMapping("decrypt-resetCode")
	public void decryptResetCode(SocketInfo socketInfo) {

		DecryptRoom room = (DecryptRoom) appInfo.getRoom(socketInfo.getRoomId());
		CommonLogic.actionHandler(() -> {
			room.resetCode();
		}, room, simpMessagingTemplate, socketInfo);
	}

	@MessageMapping("decrypt-resetTeam")
	public void decryptResetTeam(SocketInfo socketInfo) {
		DecryptRoom room = (DecryptRoom) appInfo.getRoom(socketInfo.getRoomId());
		CommonLogic.actionHandler(() -> {
			room.resetTeam();
		}, room, simpMessagingTemplate, socketInfo);
	}

	@MessageMapping("decrypt-choiceteam")
	public void decryptchoiceTeam(SocketInfo socketInfo) {
		DecryptRoom room = (DecryptRoom) appInfo.getRoom(socketInfo.getRoomId());
		CommonLogic.actionHandler(() -> {
			room.choiceTeam(socketInfo.getUserName(), (Integer) socketInfo.getObj());
		}, room, simpMessagingTemplate, socketInfo);
	}

	@MessageMapping("decrypt-init")
	public void decryptInit(SocketInfo socketInfo) {
		DecryptRoom room = (DecryptRoom) appInfo.getRoom(socketInfo.getRoomId());
		CommonLogic.actionHandler(() -> {
			room.init();
		}, room, simpMessagingTemplate, socketInfo);
	}

	@SuppressWarnings("unchecked")
	@MessageMapping("decrypt-createcodeword")
	public void decryptCreateCodeWord(SocketInfo socketInfo) {
		DecryptRoom room = (DecryptRoom) appInfo.getRoom(socketInfo.getRoomId());
		CommonLogic.actionHandler(() -> {
			room.createCodeWord(socketInfo.getUserName(), (List<String>) socketInfo.getObj());
		}, room, simpMessagingTemplate, socketInfo);
	}

	@MessageMapping("decrypt-handUpCreateCode")
	public void decryptHandUpCreateCode(SocketInfo socketInfo) {
		DecryptRoom room = (DecryptRoom) appInfo.getRoom(socketInfo.getRoomId());
		CommonLogic.actionHandler(() -> {
			room.handUpCreateCode(socketInfo.getUserName());
		}, room, simpMessagingTemplate, socketInfo);
	}

	@SuppressWarnings("unchecked")
	@MessageMapping("decrypt-decryptCode")
	public void decryptDecryptCode(SocketInfo socketInfo) {
		DecryptRoom room = (DecryptRoom) appInfo.getRoom(socketInfo.getRoomId());
		CommonLogic.actionHandler(() -> {
			room.decryptCode(socketInfo.getUserName(), (List<Integer>) socketInfo.getObj());
		}, room, simpMessagingTemplate, socketInfo);
	}

}
