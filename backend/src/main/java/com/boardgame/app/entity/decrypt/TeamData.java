package com.boardgame.app.entity.decrypt;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class TeamData implements Serializable {

	private static final long serialVersionUID = 2730014689989785234L;
	private int successChipCount;
	private int faildChipCount;
	private List<String> codeWordList;
	private List<TurnData> turnDataList;
	private boolean tebanFlg;

	public TeamData() {
		super();
		tebanFlg = false;
		successChipCount = 0;
		faildChipCount = 0;
		turnDataList = new ArrayList<TurnData>();
	}

	public void addTurnData(List<Integer> codeList) {
		TurnData turnData = new TurnData();
		turnData.setCryptCodeList(codeList);
		turnDataList.add(turnData);
	}

	public TurnData findLatestTurnData() {
		return turnDataList.get(turnDataList.size() - 1);
	}

	public void addFaildChipCount() {
		faildChipCount++;
	}

	public void addSuccessChipCoun() {
		successChipCount++;
	}

}
