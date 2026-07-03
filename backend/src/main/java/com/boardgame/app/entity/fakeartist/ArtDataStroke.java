
package com.boardgame.app.entity.fakeartist;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class ArtDataStroke implements Serializable {
	private static final long serialVersionUID = -21342577681630409L;

	private List<ArtData> artDataList;
	private String name;
	private String color;
	private int lineWidth;
	private boolean endFlg;

	public ArtDataStroke() {
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public ArtDataStroke(Object obj) {
		Map map = (Map) obj;
		this.name = (String) map.get("name");
		this.color = (String) map.get("color");
		this.lineWidth = (Integer) map.get("lineWidth");
		this.endFlg = (Boolean) map.get("endFlg");

		List<Map> paramList = (List<Map>) map.get("artDataList");
		this.artDataList = new ArrayList<ArtData>();
		for (Map mapData : paramList) {
			artDataList.add(new ArtData(mapData));
		}

	}
}
