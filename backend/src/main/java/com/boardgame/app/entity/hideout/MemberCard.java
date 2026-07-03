package com.boardgame.app.entity.hideout;

import java.io.Serializable;

import lombok.Data;

@Data
public class MemberCard implements Serializable {
	private static final long serialVersionUID = 5182345193586664107L;

	private int cardType;
	private boolean consumeFlg;
	private int no;
	private int haveUserIndex;

	public MemberCard(int cardType) {
		super();
		this.cardType = cardType;
		this.consumeFlg = false;
		haveUserIndex = 0;
	}
}
