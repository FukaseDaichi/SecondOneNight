package com.boardgame.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boardgame.app.component.ApplicationInfoBeean;
import com.boardgame.app.entity.Room;
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

}
