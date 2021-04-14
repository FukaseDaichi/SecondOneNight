package com.boardgame.app.entity;

import java.io.Serializable;

import lombok.Data;

@Data
public class SocketInfo implements Serializable {
	private static final long serialVersionUID = 1836658254396902236L;

	private int status;
	private String roomId;
	private String userName;
	private String message;
	private Object obj;

	public SocketInfo(int status, String message, Object obj) {
		super();
		this.status = status;
		this.message = message;
		this.obj = obj;
	}

}
