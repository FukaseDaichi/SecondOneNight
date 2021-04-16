package com.boardgame.app.entity.hideout;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class BuildingCard implements Serializable {

	private static final long serialVersionUID = 4983549308136127379L;

	private int catdType;
	private boolean openFlg;
	private int no;
	private List<Integer> waitUserIndexList;

	public BuildingCard(boolean openFlg, int catdType) {
		super();
		this.openFlg = openFlg;
		this.catdType = catdType;
		waitUserIndexList = new ArrayList<Integer>();
	}

}
