package com.boardgame.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boardgame.app.component.ApplicationInfoBeean;
import com.boardgame.app.constclass.decrypt.DecryptConst;
import com.boardgame.app.constclass.hideout.HideoutConst;
import com.boardgame.app.constclass.werewolf.WereWolfConst;
import com.boardgame.app.entity.Room;
import com.boardgame.app.entity.decrypt.DecryptRoom;
import com.boardgame.app.entity.hideout.HideoutRoom;
import com.boardgame.app.entity.werewolf.WerewolfRoom;
import com.boardgame.app.service.TimeBombService;

@Controller
@RestController
public class MainController {

	@Autowired
	private ApplicationInfoBeean appInfo;

	@Autowired
	private TimeBombService timeBombService;

	@CrossOrigin
	@RequestMapping(value = { "/createroom" })
	public Room createTimeBombRoom() {
		String roomId = timeBombService.createTimeBombRoom();
		Room room = appInfo.getRoom(roomId);
		return room;
	}

	@CrossOrigin
	@RequestMapping(value = { "/createroom/werewolf" })
	public Room createWerwolfRoom() {
		String roomId = appInfo.createRoomId();
		Room room = new WerewolfRoom();
		room.setRoomId(roomId);
		room.setRoomType(WereWolfConst.ROOM_TYPE);
		appInfo.addRoom(room);
		return room;
	}

	@CrossOrigin
	@RequestMapping(value = { "/createroom/hideout" })
	public Room createHideoutRoom() {
		String roomId = appInfo.createRoomId();
		Room room = new HideoutRoom();
		room.setRoomId(roomId);
		room.setRoomType(HideoutConst.ROOM_TYPE);
		appInfo.addRoom(room);
		return room;
	}

	@CrossOrigin
	@RequestMapping(value = { "/createroom/decrypt" })
	public Room createDecryptRoom() {
		String roomId = appInfo.createRoomId();
		Room room = new DecryptRoom();
		room.setRoomId(roomId);
		room.setRoomType(DecryptConst.ROOM_TYPE);
		appInfo.addRoom(room);
		return room;
	}

}
