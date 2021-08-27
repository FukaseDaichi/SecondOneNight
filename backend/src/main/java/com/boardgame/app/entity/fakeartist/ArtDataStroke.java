
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

	public ArtDataStroke() {
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public ArtDataStroke(Object obj, String name) {
		List<Map> paramList = (List<Map>) obj;
		this.name = name;
		artDataList = new ArrayList<ArtData>();
		for (Map map : paramList) {
			artDataList.add(new ArtData(map));
		}

	}
}
