package com.boardgame.app.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boardgame.app.component.ApplicationInfoBeean;
import com.boardgame.app.entity.Room;
import com.boardgame.app.entity.timebomb.TimeBombRoom;
import com.boardgame.app.service.TimeBombService;

@Controller
@RestController
public class MainController {

	@Autowired
	private ApplicationInfoBeean appInfo;

	@Autowired
	private TimeBombService timeBombService;

	@RequestMapping(value = { "/test" })
	public Room createTimeBombRoom() {
		TimeBombRoom room = new TimeBombRoom();
		appInfo.addRomm(room);
		return room;
	}

	@RequestMapping(value = { "/test2" })
	public List<Room> c2() {
		timeBombService.createTimeBombRoom();

		return appInfo.getRoomList();
	}
}
