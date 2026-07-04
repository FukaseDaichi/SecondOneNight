package com.boardgame.app.component;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.boardgame.app.entity.Room;

import lombok.Data;

@Data
@Component
public class ApplicationInfoBeean implements Serializable {

	private static final long serialVersionUID = -4674553191149133538L;

	@Value("${app.maxroomsize}")
	private int maxRoomSize;
	private static List<Room> roomList;

	public void addRoom(Room room) {

		if (roomList == null) {
			roomList = new ArrayList<Room>();
		}

		roomList.add(room);

		// 最大部屋数超過防止
		if (roomList.size() > maxRoomSize) {
			roomList.remove(0);
		}
	}

	public String createRoomId() {

		if (roomList != null) {

			for (int i = 0; i < 100; i++) {
				String randStr = UUID.randomUUID().toString();

				if (getRoom(randStr) == null) {
					return randStr;
				}
			}

		}
		return UUID.randomUUID().toString();
	}

	public String createRoomCode() {

		Random rand = new Random();

		for (int i = 0; i < 100; i++) {
			String code = String.format("%06d", rand.nextInt(1000000));

			if (getRoomByCode(code) == null) {
				return code;
			}
		}
		return String.format("%06d", rand.nextInt(1000000));
	}

	public Room getRoom(String roomId) {

		if (roomList == null) {
			return null;
		}

		return roomList.stream().filter(o -> o.getRoomId().equals(roomId)).findAny().orElse(null);
	}

	public Room getRoomByCode(String roomCode) {

		if (roomList == null || roomCode == null) {
			return null;
		}

		return roomList.stream().filter(o -> roomCode.equals(o.getRoomCode())).findAny().orElse(null);
	}

}
