package com.boardgame.app.entity.decrypt;

import java.io.Serializable;
import java.util.List;

import lombok.Data;

@Data
public class TurnData implements Serializable {

	private static final long serialVersionUID = 343000542853561481L;

	private List<String> cryptWotdList;
	private List<Integer> cryptCodeList;
	private List<Integer> decryptList;
	private List<Integer> opponentDecryptList;

	public TurnData() {
	}

}
