
package com.boardgame.app.entity.fakeartist;

import java.io.Serializable;

import lombok.Data;

@Data
public class ArtData implements Serializable {
	private static final long serialVersionUID = -21342577681730409L;

	private int xPotision;
	private int yPotision;
	private String color;
	private String lineWidth;
	private int userNo;
	private boolean lastFlg;

	public ArtData() {
	}

}
