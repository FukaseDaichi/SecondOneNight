package com.boardgame.app.service;

import java.io.Serializable;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boardgame.app.component.ApplicationInfoBeean;
import com.boardgame.app.constclass.timebomb.TimeBombConst;
import com.boardgame.app.entity.Room;
import com.boardgame.app.entity.timebomb.TimeBombRoom;

@Service
public class TimeBombService implements Serializable {

	private static final long serialVersionUID = 2284932622913707211L;

	@Autowired
	private ApplicationInfoBeean appInfo;

	public String createTimeBombRoom() {

		String roomId = appInfo.createRoomId();
		Room room = new TimeBombRoom();
		room.setRoomType(TimeBombConst.ROOM_TYPE);
		room.setRoomId(roomId);
		appInfo.addRomm(room);
		return roomId;
	}
}
