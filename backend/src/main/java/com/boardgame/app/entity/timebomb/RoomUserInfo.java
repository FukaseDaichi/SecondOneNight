package com.boardgame.app.entity.timebomb;

import java.io.Serializable;

import lombok.Data;

@Data
public class RoomUserInfo implements Serializable {
	private static final long serialVersionUID = -1242822806394612774L;

	private RoomUserInfo() {

	}

	private String action;
	private String roomId;
	private String userName;
	private int cardIndex;
	private int winTeam;
}
