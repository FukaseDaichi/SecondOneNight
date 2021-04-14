package com.boardgame.app.entity;

import java.io.Serializable;

import lombok.Data;

@Data
public abstract class User implements Serializable {
	private static final long serialVersionUID = -1242822806394612774L;
	protected int userNo;
	protected String userId;
	protected String userName;
	protected String userIconUrl;

}
