package com.boardgame.app.entity;

import java.io.Serializable;

import lombok.Data;

@Data
public class ErrObj implements Serializable {
	private static final long serialVersionUID = 1836658254396902236L;

	private int status;
	private String message;
	private Object obj;

	public ErrObj(int status, String message, Object obj) {
		super();
		this.status = status;
		this.message = message;
		this.obj = obj;
	}

}
