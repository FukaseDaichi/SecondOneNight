package com.boardgame.app.entity.hideout;

import java.io.Serializable;

import lombok.Data;

@Data
public class BuildingCard implements Serializable {

	private static final long serialVersionUID = 4983549308136127379L;

	private int cardType;
	private boolean openFlg;
	private int no;

	public BuildingCard(boolean openFlg, int catdType) {
		super();
		this.openFlg = openFlg;
		this.cardType = catdType;
	}

}
