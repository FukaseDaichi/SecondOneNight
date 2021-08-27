
package com.boardgame.app.entity.fakeartist;

import java.io.Serializable;
import java.util.Map;

import lombok.Data;

@Data
public class ArtData implements Serializable {
	private static final long serialVersionUID = -21342577681730409L;

	private int xparamPotision;
	private int yparamPotision;
	private String color;
	private int lineWidth;

	public ArtData() {
	}

	public ArtData(Map<String, Object> map) {
		xparamPotision = (Integer) map.get("xparamPotision");
		yparamPotision = (Integer) map.get("yparamPotision");
		color = (String) map.get("color");
		lineWidth = (Integer) map.get("lineWidth");
	}

}
