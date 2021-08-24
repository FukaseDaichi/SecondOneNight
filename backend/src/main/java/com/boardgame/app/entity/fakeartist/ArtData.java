
package com.boardgame.app.entity.fakeartist;

import java.io.Serializable;

import lombok.Data;

@Data
public class ArtData implements Serializable {
	private static final long serialVersionUID = -21342577681730409L;

	private String param;
	private String userName;

	public ArtData() {
	}

}
