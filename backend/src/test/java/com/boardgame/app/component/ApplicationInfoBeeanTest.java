package com.boardgame.app.component;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import com.boardgame.app.constclass.werewolf.WereWolfConst;
import com.boardgame.app.entity.Room;
import com.boardgame.app.entity.werewolf.WerewolfRoom;

public class ApplicationInfoBeeanTest {

	private ApplicationInfoBeean newBean() {
		ApplicationInfoBeean bean = new ApplicationInfoBeean();
		bean.setMaxRoomSize(100);
		return bean;
	}

	@Test
	public void createRoomCodeは6桁数字を返す() {
		ApplicationInfoBeean bean = newBean();
		String code = bean.createRoomCode();
		assertNotNull(code);
		assertTrue(code.matches("\\d{6}"), "6桁数字であること: " + code);
	}

	@Test
	public void getRoomByCodeで部屋を引ける() {
		ApplicationInfoBeean bean = newBean();
		Room room = new WerewolfRoom();
		room.setRoomId(bean.createRoomId());
		room.setRoomType(WereWolfConst.ROOM_TYPE);
		room.setRoomCode("123456");
		bean.addRoom(room);

		Room found = bean.getRoomByCode("123456");
		assertNotNull(found);
		assertEquals(room.getRoomId(), found.getRoomId());
	}

	@Test
	public void getRoomByCodeは未存在でnull() {
		ApplicationInfoBeean bean = newBean();
		assertNull(bean.getRoomByCode("000000"));
		assertNull(bean.getRoomByCode(null));
	}
}
